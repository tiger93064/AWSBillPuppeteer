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

  

## NOTE
docker run --env=AWS_ACCOUNT_ID=<AWS_ACCOUNT_ID> --env=AWS_IAM_USERNAME=<AWS_IAM_USERNAME>  --env=AWS_PW=<AWS_PW> -p <OUTBOUND_PORT>:80  -d tiger93064/bill-crawler-higher:latest
 
 

## Links

Github repo [tiger93064/bill-crawler-higher](https://github.com/tiger93064/AWSBillPuppeteer-with-express)
Docker repo [tiger93064/bill-crawler-higher](https://hub.docker.com/r/tiger93064/bill-crawler-higher)