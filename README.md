# AWS Bill Puppeteer-with-express

A simple web crawler node service for AWS bill info made of `Express.js` and `Puppeteer`.
 

### Install dependencies ⏬

```bash
npm install
```

### Start node app ⚒️

```bash
npm run serve
```

## Additional Commands

```bash
docker build -t tiger93064/bill-crawler-higher:latest .    # build docker image to local
docker push tiger93064/bill-crawler-higher:latest          # push docker image to hub

```

  

## Docker Run Command 
docker run <br />
--env=AWS_ACCOUNT_ID=`AWS_ACCOUNT_ID` <br />
--env=AWS_IAM_USERNAME=`AWS_IAM_USERNAME`<br />
--env=AWS_PW=`AWS_PW` <br />
-p `OUTBOUND_PORT`:80  <br />
-d tiger93064/bill-crawler-higher:latest 
 
 

## Links

Github repo [tiger93064/bill-crawler-higher](https://github.com/tiger93064/AWSBillPuppeteer-with-express) <br />
Docker Hub repo [tiger93064/bill-crawler-higher](https://hub.docker.com/r/tiger93064/bill-crawler-higher)