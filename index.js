const puppeteer = require('puppeteer-core');
const { executablePath } = require('puppeteer')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

var express = require('express');
var expressApp = express();
var cors = require('cors');

const fs = require('fs');
 

//env
const port = 80
const corsOptions = {
  origin: '*',
  //origin: [
  //   'http://localhost:78',
  //   'http://localhost:8080',
  //  ],
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization','X-Parse-Application-Id'],
};

 
// const awsAccountID = process.env.AWS_ACCOUNT_ID ||'DONT'
// const awsIAMUserName = process.env.AWS_IAM_USERNAME || 'BE A'
// const awsPW = process.env.AWS_PW || 'CURIOUS CAT 🙀'
const awsRegionCode = process.env.AWS_REGION_CODE || 'us-east-1'

const cookiesExpiredAfter = 8 * 60 * 60   // cookies expired after 8 hr



//instances
var browser = null
// var page = null
// var cookie = "";

var pages = []

// init express
expressApp.use(cors(corsOptions))
expressApp.use(express.json());
expressApp.use(express.urlencoded());

expressApp.get('/bill', async (req, res) => { 
  //req.params.cmmdName  /bill/:cmmdName
  // console.log(req.query, req.query.iamAccount)

  if(!req.query.iamAccount) res.status(500).send('please assign iamAccount in parameter')
  let pageInfo = pages.find(pi => pi.loginInfo.accessKey === req.query.iamAccount)
  if(!pageInfo) res.status(500).send('AccessKey file of this iamAccount not found in server')
  // console.log(pageInfo)

  await checkCookies(pageInfo)
  res.send(await getData(pageInfo.cookie, req.query, pageInfo))

})

expressApp.listen(port, () => {
  console.log(`Express app with bill crawler is listening on port ${ port }`)
})
















 
//funcs
const checkCookies = async (pageInfo, awsRegionCode = 'us-east-1') => {
  let { loginInfo } = pageInfo
  const { awsAccountID, awsIAMUserName, awsPW } = loginInfo

  //if cookies expired
  if(pageInfo.cookieLifeCount > 0) {
    console.log('cookie valid ', awsAccountID)
    return
  }
  console.log('cookie expired', awsAccountID)

  if(pageInfo.page == null || pageInfo.page.isClosed()){
    const context = await browser.createIncognitoBrowserContext()
    pageInfo.page = await context.newPage()

  }
  
  
   

  await pageInfo.page.goto('https://'+awsAccountID+'.signin.aws.amazon.com/console');

  // Set screen size
  await pageInfo.page.setViewport({width: 1280, height: 1024});

  // Type into username box
 
  await pageInfo.page.type('#username', awsIAMUserName);
  await pageInfo.page.type('[type="password"]', awsPW);

  let st = new Date()
  // Wait and click on first result
  await pageInfo.page.click("#signin_button")


  // await page.waitForTimeout(1000)
  await pageInfo.page.waitForNavigation();
  // await page.waitForNavigation({waitUntil: 'networkidle2'});
  // await page.waitForNavigation({ waitUntil: "load" });

 
  await pageInfo.page.goto('https://'+awsRegionCode+'.console.aws.amazon.com/billing/home?region='+awsRegionCode+'#/bills', {
    timeout: 0,
    waitUntil: ['domcontentloaded']
    });


  const cookiesGot = await pageInfo.page.cookies();
  pageInfo.cookie = refactorCookies(cookiesGot)
  pageInfo.cookieLifeCount = cookiesExpiredAfter
  console.log("login "+awsAccountID+" @", new Date(), 'within ', new Date() -st)

  pageInfo.page.close()
  // await page.waitForTimeout(20000)
  // await page.screenshot({
  //   path: './screenshot/'+awsAccountID+'.jpg',
  // })

}

const getData = async (cookie, params = {}, pageInfo ) => {
  const { linkedAccountId, year, month, iamAccount} = params
  console.log('getting with params', pageInfo.loginInfo.billingGroup, linkedAccountId, year, month, iamAccount)
 

  const res = await fetch('https://'+awsRegionCode+'.console.aws.amazon.com/billing/rest/v1.0/bill/linked/completebill?'
    + 'linkedAccountId=' + linkedAccountId
    +'&year='+year
    +'&month='+month
    +'&groupBy=ServiceProvider'
    + (pageInfo.loginInfo.billingGroup ? '&billingViewArn=arn:aws:billing::'+pageInfo.loginInfo.awsAccountID+':billingview/billing-group-'+pageInfo.loginInfo.billingGroup : '')
    ,
    {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'cookie': cookie
      }
    }
  )
      
  return {
    params: {
      billingGroup: pageInfo.loginInfo.billingGroup,
      linkedAccountId: linkedAccountId,
      year: year,
      month: month
    },
    result: res.ok ? await res.json() : res.statusText
  }
  // console.log(res)
  

}

const refactorCookies = (cookies) => {
  var cookie = ''
  cookies.forEach(cookieitem => {
    cookie += cookieitem['name'] + "=" + cookieitem['value'] + "; ";
  });
  return cookie.substr(0, cookie.length - 2);

}


const checkDockerENV = () => {
  // console.log(process.env);
  if(!process.env.AWS_ACCOUNT_ID) console.log('ENV: AWS_ACCOUNT_ID cannot be empty')
  if(!process.env.AWS_IAM_USERNAME) console.log('ENV: AWS_IAM_USERNAME cannot be empty')
  if(!process.env.AWS_PW) console.log('ENV: AWS_PW cannot be empty')
  if(!process.env.AWS_REGION_CODE) console.log('ENV: AWS_REGION_CODE key not set, then be default \'us-east-1\'')

  
  if(!process.env.AWS_ACCOUNT_ID || !process.env.AWS_IAM_USERNAME || !process.env.AWS_PW) process.exit()
 

}

const init = async () => {
  // if(process.env.IS_DOCKER) checkDockerENV() 

  setInterval(() => {
    pages.forEach(pageInfo => {
      pageInfo.cookieLifeCount -= 1
    });
  }, 1000)

  browser = await puppeteer.launch( 
    (process.env.IS_DOCKER) ?
    { executablePath:  '/usr/bin/google-chrome', args: ['--no-sandbox']} : { executablePath:  executablePath() }
  )
  page = await browser.newPage();


  fs.readdirSync('./pw' , { withFileTypes: true })
  .filter((item) => !item.name.includes('example'))
  .map((item) => item.name)
  .forEach(item => {
    fs.readFile('./pw/' + item, 'utf8', (err, data) => {
      if (err) { console.error('Error reading the file:', err); return; }
      // Process the file data
      const lines = data.split('\n');
      const loginInfo = {
        awsAccountID: lines[0],
        awsIAMUserName: lines[1],
        awsPW: lines[2],
        name: lines[3],
        accessKey: item.split('.')[0]
      }
      loginInfo.billingGroup = lines.length > 4 ? lines[4] : null

      pages.push({
        loginInfo: loginInfo,
        cookieLifeCount: 0,
        page: null,
        cookie: null
      })
      checkCookies(pages[pages.length - 1])
 
       
    
      // Do something with the lines array
      // console.log(loginInfo);
    });


    // console.log(item)
  });
  // await checkCookies()

}

//init
init()






 