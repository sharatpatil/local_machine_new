const express = require('express');
const sql = require('mssql');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;
const os = require('os');
const qs = require('qs');
const { exec } = require('child_process');
const { request } = require('http');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');

const twilio = require('twilio');
const cron = require('node-cron');

const accountSid = 'AC8e77af3cdc4978fb3a3e9ea45f5d2728';
const authToken = 'ba7640d41d11626969548e953b6d106a';
const client = twilio(accountSid, authToken);


const emailTemplate = fs.readFileSync('mail_templates/device_created.html', 'utf-8');

// Parse JSON bodies
app.use(bodyParser.json());

app.get('/', (req, res)=>{
	res.status(200);
	res.send("Welcome to root URL of Server");
});

async function myTriggeredFunction(part, parameter, values) {
  try {
    const data = qs.stringify({
      'module': 'TRANS_SMS',
      'apikey': '8f9f930b-01f3-11ee-addf-0200cd936042',
      'to': '918139081300,919496001112,919825404757,918292244660',
      // 'to':'916364124241',
      'from': 'PQSIVM',
      'msg': `Data Points Outside the Limits. Following are the details
    Part Number: ${part}
    Parameter Name: ${parameter}
    Value: ${values} -PQSI`
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://2factor.in/API/R1/',
      headers: {},
      data: data
    };

    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to be caught by the caller
  }
}




const config = {
    user: 'sa',
    password: 'sa123',
    server: 'SQCPACKSYSTEM\\SQLEXPRESS',
    // server: 'DESKTOP-0EIKRB0\\SQLSERVER',
    database: 'test',
    options: {           
        encrypt: false
    }
};

sql.connect(config)
  .then(() => {
    console.log('Connected to the MSSQL database.')
  })
  .catch((err) => {
    console.error('Error:', err);
  });

  app.post('/devices', async (req, res) => {
    try {
      const deviceData = req.body;

      const {
        deviceName,
        deviceNumber1,
        deviceNumber2,
        deviceNumber3,
        deviceNumber4,
        parameterName1,
        parameterName2,
        parameterName3,
        parameterName4,
        parameterName5,
        parameterName6,
        parameterName7,
        parameterName8,
        parameterName9,
        parameterName10,
        parameter1,
        parameter2,
        parameter3,
        parameter4,
        parameter5,
        parameter6,
        parameter7,
        parameter8,
        parameter9,
        parameter10,
        UserId
      } = deviceData;

      // const device_id =  'DEV' + (Math.floor(Math.random() * 9000) + 1000).toString() 
      
      // Retrieve parameter limitations from the database
      const query1 = `SELECT parameter_name, upper_limit, lower_limit FROM Config WHERE part_number = '${deviceNumber1}'`;
    const result1 = await sql.query(query1);
    const limitations = result1.recordset;

    
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sqcpack.co.in@gmail.com',
    pass: 'sxiyujgfvijcwdrv'
  }
});


let hasExceededLimits = false


    
    limitations.forEach((limit) => {
      const paramName = limit.parameter_name;
      const paramValue = deviceData[paramName];
      const upperLimit = limit.upper_limit;
      const lowerLimit = limit.lower_limit;

      if (paramValue < lowerLimit || paramValue > upperLimit) {
        console.log('Out of range',lowerLimit, deviceData[paramName], upperLimit)
        hasExceededLimits = true;
        
        const emailBody = emailTemplate
          .replace('{{deviceNumber1}}', deviceNumber1 || '')
          .replace('{{deviceNumber2}}', deviceNumber2 || '')
          .replace('{{deviceNumber3}}', deviceNumber3 || '')
          .replace('{{deviceNumber4}}', deviceNumber4 || '')
          .replace('{{paramName}}', paramName || '')
          .replace('{{paramValue}}', paramValue || '');

        const mailOptions = {
          from: 'sqcpack.co.in@gmail.com',
          to: ['retheeshzahi@gmail.com','Shafizahi@gmail.com',' Abdul.rahim@ceat.com','Sunny.singj@ceat.com'],
          subject: 'Alert: Data Point Outside the Limits',
          html: emailBody
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        const result =  myTriggeredFunction(deviceNumber1, paramName, paramValue);

        // const phoneNumber = ['+918139081300','+919496001112','+919825404757','+918292244660'];
        // const smsMessage = `Data Point Outside the Limits with the following details \n Part Number: ${deviceNumber1} \n Parameter Name: ${paramName} \n Value: ${paramValue}`;
    
    
        // const smsPromises = phoneNumber.map((phoneNumber) => {
          
    
        //   client.messages
        //   .create({
        //     body: smsMessage,
        //     from: '+12187789426',
        //     to: phoneNumber
        //   })
        //   .then((message) => console.log('SMS sent:', message.sid))
        //   .catch((error) => console.error('SMS error:', error));
        // });

      }
    });

   

    // If validation passes, proceed with inserting data into the database
    const device_id =
      'DEV' + (Math.floor(Math.random() * 9000) + 1000).toString();
      
      const query = `INSERT INTO devices (device_id, device_name,device_number1, device_number2, device_number3, device_number4, parameter_name1, parameter_name2, parameter_name3, parameter_name4, parameter_name5, parameter_name6, parameter_name7,parameter_name8, parameter_name9, parameter_name10, parameter1, parameter2, parameter3, parameter4, parameter5, parameter6, parameter7, parameter8, parameter9, parameter10, user_id) 
                     VALUES ('${device_id}', '${deviceName}', '${deviceNumber1}', '${deviceNumber2}', '${deviceNumber3}', '${deviceNumber4}',  '${parameterName1}', '${parameterName2}', '${parameterName3}', '${parameterName4}', '${parameterName5}', '${parameterName6}', '${parameterName7}', '${parameterName8}', '${parameterName9}', '${parameterName10}', '${parameter1}', '${parameter2}', '${parameter3}', '${parameter4}', '${parameter5}', '${parameter6}', '${parameter7}', '${parameter8}', '${parameter9}', '${parameter10}', ${UserId})`;

    
      const result = await sql.query(query)

      

    //   console.log('Data inserted successfully:', result);
  
      // res.status(200).json({ message: 'Data inserted successfully' });
      res.json({deviceData,hasExceededLimits})
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  

  cron.schedule('30 18 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

    // Modify your SQL query to select records created today
    const query1 = `SELECT * FROM devices WHERE created_at >= @today`;
    const request = new sql.Request();
    request.input('today', sql.Date, today);
    const result = await request.query(query1);
    const devices = result.recordset;

    // const devices = await request.query(query1);

    const excelBuffer = await generateExcel(devices);
    sendEmailWithAttachment(excelBuffer);
    res.send('Email sent with Excel attachment.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from the database' });
  }
});



async function generateExcel(data) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Device Data');

  let hasData = false;

  data.forEach(row => {
    const rowData = [
      row.id || '',
      row.deviceId || '',
      row.deviceNumber1 || '',
      row.indenfier || '',
      row.parameterName1 || '',
      row.parameter1 || '',
      row.parameterName2 || '',
      row.parameter2 || '',
      row.parameterName3 || '',
      row.parameter3 || '',
      row.parameterName4 || '',
      row.parameter4 || '',
      row.parameterName5 || '',
      row.parameter5 || '',
      row.parameterName6 || '',
      row.parameter6 || '',
      row.parameterName7 || '',
      row.parameter7 || '',
      row.parameterName8 || '',
      row.parameter8 || '',
      row.parameterName9 || '',
      row.parameter9 || '',
      row.parameterName10 || '',
      row.parameter10 || '',
      row.createdAt || ''
    ];

    worksheet.addRow(rowData);

    // Check if any row value is present
    if (!hasData && Object.values(row).some(val => val !== null && val !== undefined && val !== '')) {
      hasData = true;
    }
  });

  if (hasData) {
    const headers = [
      'S.No',
      'Device ID',
      'Part Number',
      'Component ID',
      'Parameter Name',
      '1',
      'Parameter Name',
      '2',
      'Parameter Name',
      '3',
      'Parameter Name',
      '4',
      'Parameter Name',
      '5',
      'Parameter Name',
      '6',
      'Parameter Name',
      '7',
      'Parameter Name',
      '8',
      'Parameter Name',
      '9',
      'Parameter Name',
      '10',
      'Date'
    ];

    worksheet.spliceRows(1, 0, headers);
  }

  return workbook.xlsx.writeBuffer();
}



function sendEmailWithAttachment(excelBuffer) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sqcpack.co.in@gmail.com',
      pass: 'sxiyujgfvijcwdrv'
    }
  });

  const mailOptions = {
    from: 'sqcpack.co.in@gmail.com',
    to: ['sharathkumarpatil06@gmail.com','retheeshzahi@gmail.com','Shafizahi@gmail.com',' Abdul.rahim@ceat.com','Sunny.singj@ceat.com'],
    subject: 'IDS Data Report',
    text: 'Please find attached today data report',
    attachments: [
      {
        filename: 'generated.xlsx',
        content: excelBuffer
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}



  

  // Execute the ipconfig command
  exec('ipconfig', (error, stdout) => {
    if (error) {
      console.error(`Error executing ipconfig: ${error}`);
      return;
    }
  
    // Output the ipconfig results
    console.log(stdout);
  });
  
app.listen(PORT, (error) =>{
	if(!error)
		console.log("Server is Successfully Running, and App is listening on port "+ PORT + os.hostname)
	else
		console.log("Error occurred, server can't start", error);
	}
);

