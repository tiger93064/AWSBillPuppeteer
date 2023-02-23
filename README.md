# AWS Bill Puppeteer-with-express

A simple web crawler node service for AWS bill info made of `Express.js` and `Puppeteer`.
 

### Install dependencies 📚

```bash
npm install
```

### Start node app 

```bash
npm run serve
```

## API Document 📔

### Get Bill

```bash
`GET` http://`YOUR MACHINE IP`/bill
```

with following query string<br />
`billingGroup` :String<br />
`linkedAccountId` :String<br />
`year` :String<br />
`month` :String<br />




<br /><br />
  

## Docker Command 🚧
docker run <br />
--env=AWS_ACCOUNT_ID=`AWS_ACCOUNT_ID` <br />
--env=AWS_IAM_USERNAME=`AWS_IAM_USERNAME`<br />
--env=AWS_PW=`AWS_PW` <br />
--env=AWS_REGION_CODE=`AWS_REGION_CODE` (optional default: 'us-east-1')<br />
-p `OUTBOUND_PORT`:80  <br />
-d tiger93064/bill-crawler-higher:latest 
 
### Additional Commands

```bash
docker build -t tiger93064/bill-crawler-higher:latest .    # build docker image ⚠️the dot
docker push tiger93064/bill-crawler-higher:latest          # push docker image to hub

```

## Links

Github repo [tiger93064/bill-crawler-higher](https://github.com/tiger93064/AWSBillPuppeteer-with-express) <br />
Docker Hub repo [tiger93064/bill-crawler-higher](https://hub.docker.com/r/tiger93064/bill-crawler-higher)