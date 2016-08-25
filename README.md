#checkbooknyc-proxy-api

A simple express.js proxy api for Checkbook NYC data.

##Why

The New York City Comptroller's Office has put together a financial transparency site at [Checkbooknyc.com](http://www.checkbooknyc.com) where you can search for individual transactions, vendors, etc.  

[It also has an API](http://www.checkbooknyc.com/spending-api#sample-request-spending), but it's not very user-friendly and requires POSTing massive XML payloads and getting equally massive XML responses.  I wanted to write a simple proxy API endpoint that would abstract away all the XML and have a simpler URL structure.

##My Lonely JSON Endpoint

I am interested in getting all transactions for a single capital project, so the two search criteria I am including in my POST to checkbooknyc's XML API are `spending_category`:`cc` and `capital_project_code`:`{myprojectid}`.  

This is abstracted away behind a beautiful proxy URL:

`/api/capitalprojects/:projectid`, where `projectid` is the managing agency code + the FMS project id. Read below for more about project ids.

Capital Project IDs, aka FMS IDs can be found in the [Capital Commitment Plans](http://www1.nyc.gov/site/omb/publications/finplan04-16.page) published by OMB.   

In the capital commitment plan, a project ID is unique to its managing agency, which is expressed as a 3-digit code.  

![cursor_and_g0332v00__pdf](https://cloud.githubusercontent.com/assets/1833820/17956854/d7a27f0e-6a5a-11e6-9011-6b1322cbf627.png)

In the above snippet from a capital commitment plan document, the Juniper Bocce Court has a managing agency code of `846` (Department of Parks and Recreation) and a project id of `P-405JVBC`, and includes a cost code of `305`

*In Checkbook NYC, `capital_project_code` is a concatenation of the managing agency code + projectid + cost code*, so we should be able to find a match by searching for `846P-405JVBC305`.  As of 8/25/16 this combination does not yield any results in checkbook NYC, but I learned from trial and error that it is doing a 'startswith' search, and you can pass in just the managing agency code + projectid and get all partial matches.

This proxy API converts the XML response into a nice JSON array, and gives you back a status and message for good measure.  For the juniper bocce court example, the request would be `http://localhost:3000/api/spending/capitalprojects/846P-405JVBC` and the JSON response looks like:

```
{
  status: "success",
  message: "found 17 transactions matching project id 846P-405JVBC",
  data: [
    {
    agency: "Department of Parks and Recreation",
    associated_prime_vendor: "N/A",
    capital_project: "846P-405JVBC310",
    contract_ID: "CT184620131428382",
    check_amount: "298800.52",
    department: "BOROUGH PRESIDENT FUNDING FOR MISCELLANE",
    document_id: "20150080889-1-DSB-EFT",
    expense_category: "IOTB CONSTRUCTION",
    fiscal_year: "2015",
    industry: "Construction Services",
    issue_date: "2014-09-02",
    mwbe_category: "Asian American",
    payee_name: "VENUS GROUP, INC",
    spending_category: "Capital Contracts",
    sub_contract_reference_id: { },
    sub_vendor: "No"
    },
    {
    agency: "Department of Parks and Recreation",
    associated_prime_vendor: "N/A",
    capital_project: "846P-405JVBC310",
    contract_ID: "CT184620131428382",
    check_amount: "202978.01",
    department: "400-846-Q45",
    document_id: "20140464755-1-DSB-EFT",
    expense_category: "IOTB CONSTRUCTION",
    fiscal_year: "2014",
    industry: "Construction Services",
    issue_date: "2014-06-09",
    mwbe_category: "Asian American",
    payee_name: "VENUS GROUP, INC",
    spending_category: "Capital Contracts",
    sub_contract_reference_id: { },
    sub_vendor: "No"
  },
...

``` 

##How to Use

- Have node.js
- Clone this repo
- Install dependencies `npm install`
- Run it `npm start`
- The proxy API should be available at `http://localhost:3000/`
- My lonely capital projects endpoint is available at `http://localhost:3000/api/capitalprojects/:projectid`

##TODO

- Host it somewhere
- Add more endpoints for common searches and other transaction types
- Build a fancy frontend tool to visualize/list the results

Pull requests are welcomed!  Take a look at `/routes/index.js` to see the XML template that gets passed to Checkbook NYC.  Feel free to create new endpoints for whatever financial data you're searching for!
