const puppeteer = require('puppeteer-core');
const { executablePath } = require('puppeteer')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

var express = require('express');
var expressApp = express();
var cors = require('cors');
 

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

 
const awsAccountID = process.env.AWS_ACCOUNT_ID ||'DONT'
const awsIAMUserName = process.env.AWS_IAM_USERNAME || 'BE A'
const awsPW = process.env.AWS_PW || 'CURIOUS CAT 🙀'
const awsRegionCode = process.env.AWS_REGION_CODE || 'us-east-1'

const cookiesExpiredAfter = 8 * 60 * 60   // cookies expired after 8 hr



//instances
var browser = null
var page = null
var cookie = "";
var cookieLifeCount = -1


// init express
expressApp.use(cors(corsOptions))
expressApp.use(express.json());
expressApp.use(express.urlencoded());

expressApp.get('/bill', async (req, res) => { 
  //req.params.cmmdName  /bill/:cmmdName
  console.log(req.query)

  await checkCookies()
  res.send(await getData(cookie, req.query))

})

expressApp.listen(port, () => {
  console.log(`Express app with bill crawler is listening on port ${ port }`)
})
















 
//funcs
const checkCookies = async () => {
  //if cookies expired
  if(cookieLifeCount > 0) {
    console.log('cookie valid')
    return
  }
  console.log('cookie expired')

  await page.goto('https://'+awsAccountID+'.signin.aws.amazon.com/console');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Type into username box
 
  await page.type('#username', awsIAMUserName);
  await page.type('[type="password"]', awsPW);

  let st= new Date()
  // Wait and click on first result
  await page.click("#signin_button")


  await page.waitForTimeout(1000)
  // await page.waitForNavigation();
  // await page.waitForNavigation({waitUntil: 'networkidle2'});
  // await page.waitForNavigation({ waitUntil: "load" });

 
  await page.goto('https://'+awsRegionCode+'.console.aws.amazon.com/billing/home?region='+awsRegionCode+'#/bills', {
    timeout: 0,
    waitUntil: ['domcontentloaded']
    });


  const cookiesGot = await page.cookies();
  cookie = refactorCookies(cookiesGot)
  cookieLifeCount = cookiesExpiredAfter
  console.log("login @", new Date(), 'within ', new Date() -st)

}

const getData = async (cookie, params = {}) => {
  const { billingGroup = '748338664416', linkedAccountId = '069472907614', year = '2023', month = '1' } = params
  console.log('getting with params', billingGroup, linkedAccountId, year, month)
 

  const res = await fetch('https://'+awsRegionCode+'.console.aws.amazon.com/billing/rest/v1.0/bill/linked/completebill?'
    + 'linkedAccountId=' + linkedAccountId
    +'&year='+year
    +'&month='+month
    +'&groupBy=ServiceProvider&billingViewArn=arn:aws:billing::'+awsAccountID+':billingview/billing-group-'+billingGroup,
    {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'cookie': cookie
      }
    }
  )
      
  return {
    params: {
      billingGroup: billingGroup,
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
  if(process.env.IS_DOCKER) checkDockerENV() 

  setInterval(() => {
    cookieLifeCount -= 1
  }, 1000)

  browser = await puppeteer.launch( 
    (process.env.IS_DOCKER) ?
    { executablePath:  '/usr/bin/google-chrome', args: ['--no-sandbox']} : { executablePath:  executablePath()}
  )
  page = await browser.newPage();

  await checkCookies()

}

//init
init()






 