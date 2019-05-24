<p align="center">
    <img src="./logo.png" width="100">
</p>
<h1 align="center">A11ygator</h1>

An application and Twitter bot that bites websites to taste their accessibility.

Infrastructure
--------------

![Infrastructure overview](./infrastructure.png)

* The app (static HTML+JS+CSS files) is stored on a bucket and is served via CloudFront.
* Informations about the generated reports are saved in a DynamoDB table, used for de-duplication and statistics.
* The screenshots are stored on another bucket, along with JSON reports, and are served via CloudFront—`/screenshots/*` path pattern.
* The API is configured via API Gateway, and proxied via CloudFront—`/api/*` path pattern.

### API Endpoints

- `GET /api/webhooks/twitter`: endpoint required by Twitter for webhooks, to pass Challenge Response Check (CRC).
- `POST /api/webhooks/twitter`: Twitter webhook that will receive payloads and selectively enqueue messages into the SQS Queue for reports to be generated.
- `POST /api/reports`: endpoint to manually enqueue a report generation.
- `GET /api/reports/{id}`: endpoint to obtain a generated report in either JSON or HTML format — it will return 404 until the report is ready.

### Background processing

* Report generation requests are saved in DynamoDB and sent to a SNS Queue.
* Enqueued messages are consumed by a Lambda function that loads the URL, waits for the configured amount of time, and runs Pa11y with the configured standard, then takes two screenshots (viewport and full-page), uploads the screenshots and the report JSON to an S3 bucket, updates the information saved in DynamoDB, and sends a notification to a SNS Topic.
* A Lambda function is listening for notifications of generated reports that were requested via Twitter, and tweets a reply by uploading the viewport screenshot to Twitter and attaching it to a Tweet that contains aggregate data and a link to the HTML report.
