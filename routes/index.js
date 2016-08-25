var express = require('express');
var router = express.Router();
var Mustache = require('mustache');
var Request = require('request');
var parser = require('xml2json');

requestXMLTemplate = `<request>
    <type_of_data>Spending</type_of_data>
    <records_from>1</records_from>
    <max_records>1000</max_records>
    <search_criteria>
        <criteria>
            <name>spending_category</name>
            <type>value</type>
            <value>cc</value>
        </criteria>
        <criteria>
            <name>capital_project_code</name>
            <type>value</type>
            <value>{{projectid}}</value>
        </criteria>
    </search_criteria>
    <response_columns>
        <column>agency</column>
        <column>fiscal_year</column>
        <column>document_id</column>
        <column>payee_name</column>
        <column>department</column>
        <column>check_amount</column>
        <column>expense_category</column>
        <column>contract_ID</column>
        <column>capital_project</column>
        <column>industry</column>
        <column>issue_date</column>
        <column>spending_category</column>
        <column>mwbe_category</column>
        <column>sub_vendor</column>
        <column>associated_prime_vendor</column>
        <column>sub_contract_reference_id</column>
    </response_columns>
</request>`



router.get('/spending/capitalprojects/:projectid', function(req, res){
  var requestXML = Mustache.render(requestXMLTemplate, req.params)

  console.log('Requesting data from checkbooknyc.com...')
  Request.post(
      {url:'http://checkbooknyc.com/api',
      body : requestXML,
      headers: {'Content-Type': 'text/xml'}
      },
      function (error, response, body) {        
          if (!error && response.statusCode == 200) {
              console.log('Processing XML response...')
              var json = convertXML(body, req.params.projectid)
              console.log('Sending JSON response...')
              res.send(json)
          } 
      }
  );



});

function convertXML(xml, projectid) {

  var json = parser.toJson(xml, {
    object: true
  })

  var count = json.response.result_records.record_count;
  console.log('Got ' + count + ' transactions!')

  if(count == '0') {
    return {
      status: 'success',
      message: 'no transactions found matching project id "' + projectid + '"',
      data: null
    }
  } else {
    var transactions = json.response.result_records.spending_transactions.transaction
    return {
      status: 'success',
      message: 'found ' + count + ' transactions matching project id ' + projectid ,
      data: transactions
    }    
  }
}

module.exports=router;