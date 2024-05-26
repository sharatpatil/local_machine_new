const express = require('express');
const sql = require('mssql');
const app = express();
app.use(express.json());
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 5003;

const Config = require('./Config.json');
// SQL Server configuration

// Middleware
app.use(bodyParser.json());

const config = {
    user: Config.database_user,
    password: Config.database_pass,
    // server: 'SQCPACKSYSTEM\\SQLEXPRESS',
    server: Config.MysqlServer,
    // server: 'DESKTOP-0EIKRB0\\SQLSERVER',
    database: Config.database_name,
    options: {           
        encrypt: false
    }
};

// Connect to SQL Server
sql.connect(config)
    .then(pool => {
        console.log('Connected to SQL Server');
    })
    .catch(err => {
        console.error('Error connecting to SQL Server:', err);
    });



 // Route to insert data into ChartData table
app.post('/chartdata', async (req, res) => {
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Extract data from the request body
      const {
        ChartName,
        SeriesName,
        ChartType,
        YAxisTitle,
        LowerLimit,
        LowerLimitText,
        UpperLimit,
        UpperLimitText,
        AvgLimit,
        AvgLimitText,
        PartNumber,
        ParameterName,
        usl,
        lsl,
        n_value,
        type
      } = req.body;
  
      // Create a new request object
      const request = new sql.Request();
  
      // Insert the data into the ChartData table
      await request.query(`
        INSERT INTO ChartData (ChartName, SeriesName, ChartType, YAxisTitle, lower_limit, lowet_limit_text, upper_limit, upper_limit_text, avg_limit, avg_limit_text, part_number, parameterName, usl,lsl, n_value, type)
        VALUES ('${ChartName}', '${SeriesName}', '${ChartType}', '${YAxisTitle}', ${LowerLimit}, '${LowerLimitText}', ${UpperLimit}, '${UpperLimitText}', ${AvgLimit}, '${AvgLimitText}', '${PartNumber}', '${ParameterName}','${usl}', '${lsl}','${n_value}', '${type}')
      `);
  
      res.send('Data inserted successfully');
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
    } finally {
      // Close the connection
      sql.close();
    }
  });


 // Route to get data from ChartData table
app.get('/chartdata', async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query data from the ChartData table
    const result = await request.query('SELECT TOP 1 * FROM ChartData;');
    const data = result.recordset;

    const chartDataArray = data.map(results => {
      return {
        series: [
          {
            name: `${results.SeriesName}`,
            data: [5, 6, 7, 5, 8], // Example data, adjust as needed
          },
        ],
        options: {
          chart: {
            height: 350,
            type: `${results.ChartType}`,
            stacked: false,
          },
          xaxis: {
            categories: ['10:30', '11:00', '11:30', '12:00', '12:30'], // Example categories, adjust as needed
          },
          yaxis: [
            {
              title: {
                text: `${results.YAxisTitle}`,
              },
            },
          ],
          markers: {
            size: 8,
          },
          annotations: {
            yaxis: [
              {
                y: `${results.lower_limit}`,
                borderColor: '#FF0000',
                borderWidth: 5,
                label: {
                  borderColor: "#FF0000",
                  style: {
                    color: '#fff',
                    background: '#FF0000',
                  },
                  text: `${results.lower_limit_text}`,
                },
              },
              {
                y: `${results.avg_limit}`,
                borderColor: '#008400',
                borderWidth: 5,
                label: {
                  borderColor: '#008400',
                  style: {
                    color: '#fff',
                    background: '#008400',
                  },
                  text: `${results.avg_limit_text}`,
                },
              },
              {
                y: `${results.upper_limit}`,
                borderColor: '#FF0000',
                borderWidth: 5,
                strokeDashArray: 0,
                label: {
                  borderColor: '#FF0000',
                  style: {
                    color: '#fff',
                    background: '#FF0000',
                  },
                  text: `${results.upper_limit_text}`,
                },
              },
            ],
          },
        },
      };
    });

    // Send the result as JSON
    res.json({ chartData: chartDataArray });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});



// Route to get ChartName and part_number from ChartData table
app.get('/get_charts', async (req, res) => {
  try {
   // Connect to the database
   await sql.connect(config);

   // Create a new request object
   const request = new sql.Request();

    // Query data from the ChartData table
    const result = await request.query('SELECT id ,ChartName, part_number, ChartType, parameterName FROM ChartData');

    // Extract the result
    const data = result.recordset;

    // Send the result as JSON
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});


// Route to get unique part_number from ChartData table
app.get('/get_unique_part_numbers', async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query unique part_number data from the ChartData table
    const result = await request.query('SELECT DISTINCT part_number FROM ChartData');

    // Extract the part_number values
    const partNumbers = result.recordset.map(record => record.part_number);

    // Send the result as JSON array
    res.json(partNumbers);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});


// Route to get unique parameterName from ChartData table
app.get('/get_unique_parameter_names', async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query unique parameterName data from the ChartData table
    const result = await request.query('SELECT DISTINCT parameterName FROM ChartData');

    // Extract the parameterName values
    const parameterNames = result.recordset.map(record => record.parameterName);

    // Send the result as JSON array
    res.json(parameterNames);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});




// Route to delete a chart by its ID
app.delete('/delete_chart/:id', async (req, res) => {
  try {
    // Get the chart ID from the request parameters
    const chartId = req.params.id;

    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Delete the chart from the ChartData table
    await request.input('id', sql.Int, chartId).query('DELETE FROM ChartData WHERE id = @id');

    // Send a success response
    res.status(200).send('Chart deleted successfully');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});




app.post('/update_chart/:id', async (req, res) => {
  const chartId = req.params.id;
  const {
    ChartName,
    SeriesName,
    ChartType,
    YAxisTitle,
    LowerLimit,
    LowerLimitText,
    UpperLimit,
    UpperLimitText,
    AvgLimit,
    AvgLimitText,
    PartNumber,
    ParameterName,
    usl,
    lsl,
    n_value,
    type
  } = req.body;

  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Define the update query
    const query = `
      UPDATE ChartData
      SET
        ChartName = @ChartName,
        SeriesName = @SeriesName,
        ChartType = @ChartType,
        YAxisTitle = @YAxisTitle,
        lower_limit = @LowerLimit,
        lowet_limit_text = @LowerLimitText,
        upper_limit = @UpperLimit,
        upper_limit_text = @UpperLimitText,
        avg_limit = @AvgLimit,
        avg_limit_text = @AvgLimitText,
        part_number = @PartNumber,
        parameterName = @ParameterName,
        usl=@usl,
        lsl=@lsl,
        n_value=@n_value,
        type=@type,
        UpdatedAt = GETDATE()
      WHERE id = @id;
    `;

    // Set input parameters for the query
    request.input('ChartName', sql.NVarChar, ChartName);
    request.input('SeriesName', sql.NVarChar, SeriesName);
    request.input('ChartType', sql.NVarChar, ChartType);
    request.input('YAxisTitle', sql.NVarChar, YAxisTitle);
    request.input('LowerLimit', sql.Float, LowerLimit);
    request.input('LowerLimitText', sql.NVarChar, LowerLimitText);
    request.input('UpperLimit', sql.Float, UpperLimit);
    request.input('UpperLimitText', sql.NVarChar, UpperLimitText);
    request.input('AvgLimit', sql.Float, AvgLimit);
    request.input('AvgLimitText', sql.NVarChar, AvgLimitText);
    request.input('PartNumber', sql.NVarChar, PartNumber);
    request.input('ParameterName', sql.NVarChar, ParameterName);
    request.input('usl', sql.NVarChar, usl);
    request.input('lsl', sql.NVarChar, lsl);
    request.input('n_value', sql.NVarChar, n_value);
    request.input('type', sql.NVarChar, type);
    request.input('id', sql.Int, chartId);

    // Execute the update query
    await request.query(query);

    // Send a success response
    res.status(200).send('Chart updated successfully');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});



// GET endpoint to retrieve chart data by ID
app.get('/get_chart/:id', async (req, res) => {
  const chartId = req.params.id;

  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query data from the ChartData table using the provided ID
    const result = await request.input('id', sql.Int, chartId)
                                   .query('SELECT * FROM ChartData WHERE id = @id;');

    const chartData = result.recordset[0];

    if (!chartData) {
      // If chart data is not found, send a 404 response
      res.status(404).send('Chart data not found');
      return;
    }

    // Send the chart data as JSON response
    res.json(chartData);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});




// // Route to get chart data by ID
// app.get('/get_chart_details/:id', async (req, res) => {
//   const chartId = req.params.id;
//   // const parameter_name = req.params.parameter_name
//   // const part_number = req.params.part_number

 
//  try {
//     // Connect to the database
  
//     await sql.connect(config);

//     // Create a new request object
//     const request = new sql.Request();
 

//     // Query data from the ChartData table using the provided ID
//     const result = await request.query(`SELECT * FROM ChartData WHERE id = ${chartId};`);

   
//     const data = result.recordset;

   

//     if (data.length === 0) {
//       res.status(404).send('Chart data not found');
//       return;
//     }

//       // Query the database to fetch the last 20 records for the specified device ID
//       const records = await request.query(`
//       SELECT TOP 20 parameter, [created_at] 
//       FROM device 
//       WHERE parameter_name in ('${data[0].parameterName}') and device_number1 = '${data[0].part_number}'
//       ORDER BY [created_at] DESC;
//   `);

//     const chartDetails = data.map(results => {
//       return {
//         series: [
//           {
//             name: `${results.SeriesName}`,
//             data: records.recordset.map(record => record.parameter)
//           },
//         ],
//         options: {
//           chart: {
//             height: 350,
//             type: `${results.ChartType}`,
//             stacked: false,
//           },
//           xaxis: {
//             categories: records.recordset.map(record => record.created_at.toISOString()) // Assuming Timestamp is a date field
//           },
//           yaxis: [
//             {
//               title: {
//                 text: `${results.YAxisTitle}`,
//               },
//             },
//           ],
//           markers: {
//             size: 8,
//           },
//           annotations: {
//             yaxis: [
//               {
//                 y: results.lower_limit,
//                 borderColor: '#FF0000',
//                 borderWidth: 5,
//                 label: {
//                   borderColor: "#FF0000",
//                   style: {
//                     color: '#fff',
//                     background: '#FF0000',
//                   },
//                   text: `${results.lower_limit_text}`,
//                 },
//               },
//               {
//                 y: results.avg_limit,
//                 borderColor: '#008400',
//                 borderWidth: 5,
//                 label: {
//                   borderColor: '#008400',
//                   style: {
//                     color: '#fff',
//                     background: '#008400',
//                   },
//                   text: `${results.avg_limit_text}`,
//                 },
//               },
//               {
//                 y: results.upper_limit,
//                 borderColor: '#FF0000',
//                 borderWidth: 5,
//                 strokeDashArray: 0,
//                 label: {
//                   borderColor: '#FF0000',
//                   style: {
//                     color: '#fff',
//                     background: '#FF0000',
//                   },
//                   text: `${results.upper_limit_text}`,
//                 },
//               },
//             ],
//           },
//         },
//       };
//     });

//     // Send the result as JSON
//     res.json({ chartData: chartDetails });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).send('Internal Server Error');
//   } finally {
//     // Close the connection
//     sql.close().catch(err => console.error('Error closing the connection:', err));
//   }
// });



// app.get('/get_chart_details/:id', async (req, res) => {
//   const chartId = req.params.id;

//   try {
//     // Connect to the database
//     await sql.connect(config);

//     // Create a new request object
//     const request = new sql.Request();

//     // Query data from the ChartData table using the provided ID
//     const result = await request.query(`SELECT * FROM ChartData WHERE id = ${chartId};`);
//     const data = result.recordset;

//     if (data.length === 0) {
//       res.status(404).send('Chart data not found');
//       return;
//     }

//     // Query the database to fetch the last 20 records for the specified device ID
//     const records = await request.query(`
//       SELECT TOP 20 parameter, [created_at] 
//       FROM device 
//       WHERE parameter_name = '${data[0].parameterName}' AND device_number1 = '${data[0].part_number}'
//       ORDER BY [created_at] DESC;
//     `);

//     const chartDetails = data.map(results => ({
//       series: [
//         {
//           name: results.SeriesName,
//           data: records.recordset.map(record => parseFloat(record.parameter)) // Assuming parameter is a numeric value
//         },
//       ],
//       options: {
//         chart: {
//           height: 350,
//           type: results.ChartType.toLowerCase(), // Ensure chart type is in lowercase
//           stacked: false,
//         },
//         xaxis: {
//           categories: records.recordset.map(record => new Date(record.created_at).toISOString()) // Properly format date
//         },
//         yaxis: [
//           {
//             title: {
//               text: results.YAxisTitle,
//             },
//           },
//         ],
//         markers: {
//           size: 8,
//         },
//         annotations: {
//           yaxis: [
//             {
//               y: parseFloat(results.lower_limit),
//               borderColor: '#FF0000',
//               borderWidth: 5,
//               label: {
//                 borderColor: "#FF0000",
//                 style: {
//                   color: '#fff',
//                   background: '#FF0000',
//                 },
//               },
//             },
//             {
//               y: parseFloat(results.avg_limit),
//               borderColor: '#008400',
//               borderWidth: 5,
//               label: {
//                 borderColor: '#008400',
//                 style: {
//                   color: '#fff',
//                   background: '#008400',
//                 },
//                 text: results.avg_limit_text,
//               },
//             },
//             {
//               y: parseFloat(results.upper_limit),
//               borderColor: '#FF0000',
//               borderWidth: 5,
//               strokeDashArray: 0,
//               label: {
//                 borderColor: '#FF0000',
//                 style: {
//                   color: '#fff',
//                   background: '#FF0000',
//                 },
//                 text: results.upper_limit_text,
//               },
//             },
//           ],
//         },
//       },
//     }));

//     const chartDetailsJSON = JSON.stringify({ chartData: chartDetails });

//     // Send the result as JSON
//     res.send(chartDetailsJSON);

//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).send('Internal Server Error');
//   } finally {
//     // Close the connection
//     sql.close().catch(err => console.error('Error closing the connection:', err));
//   }
// });


// Route to insert data into your_table_name table
app.post('/device_insert', async (req, res) => {
 let pool;
  try {
    // Connect to the database
    pool = await sql.connect(config);

    // Extract data from the request body
    const {
      part_number,
      parameter_name,
      identifier,
      values
    } = req.body;

    // Iterate over the values array and insert each value into the database
    for (let i = 0; i < values.length; i++) {
      await pool.request()
        .input('device_id', sql.NVarChar, `device_id_${i + 1}`)
        .input('device_number1', sql.NVarChar, part_number)
        .input('device_number2', sql.NVarChar, identifier)
        .input('device_number3', sql.NVarChar, null)
        .input('device_number4', sql.NVarChar, null)
        .input('parameter_name', sql.NVarChar, parameter_name)
        .input('device_name', sql.NVarChar, `device_name_${i + 1}`)
        .input('parameter', sql.NVarChar, values[i])
        .input('user_id', sql.Int, null)
        .query(`
          INSERT INTO device (
            device_id, device_number1, device_number2, device_number3,
            device_number4, parameter_name, device_name, parameter,
            user_id, created_at, updated_at
          ) VALUES (
            @device_id, @device_number1, @device_number2, @device_number3,
            @device_number4, @parameter_name, @device_name, @parameter,
            @user_id, GETDATE(), GETDATE()
          )
        `);
    }

    res.send('Data inserted successfully');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close();
  }
});



app.get('/get_chart_details/:id', async (req, res) => {
  const chartId = req.params.id;

  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query data from the ChartData table using the provided ID
    const result = await request.query(`SELECT TOP 1 * FROM ChartData WHERE id = ${chartId};`);
    const data = result.recordset;

    if (data.length === 0) {
      res.status(404).send('Chart data not found');
      return;
    }

    

    // Query the database to fetch the last 20 records for the specified device ID
    const records = await request.query(`
      SELECT parameter, [created_at] 
      FROM device 
      WHERE parameter_name = '${data[0].parameterName}' AND device_number1 = '${data[0].part_number}';
    `);



    const parameters = records.recordset.map(record => parseFloat(record.parameter));


const formattedParameters = parameters.map(value => value.toFixed(2));

// Now use formattedParameters where needed


    const avgParameter = parameters.reduce((acc, val) => acc + val, 0) / parameters.length;

      // Calculate the absolute differences
  const absoluteDifferences = [null, ...parameters.slice(1).map((value, index) => Math.abs(value - parameters[index]))];

  
const formattedabsolute = absoluteDifferences.slice(1).map(value => value.toFixed(2));


  const validDifferences = absoluteDifferences.slice(1); // Remove the first null value
  const avgAbsoluteDifference = validDifferences.reduce((acc, val) => acc + val, 0) / validDifferences.length;

    const individual_UCL = avgParameter + (2.66 * avgAbsoluteDifference)
    const individual_LCL = avgParameter - (2.66 * avgAbsoluteDifference)

    const range_UCL = 3.268 * avgAbsoluteDifference
    const range_LUL = 0


    const estimated_s_d = avgAbsoluteDifference / 1.128
    const cp = (data[0].usl-data[0].lsl) - (6 * estimated_s_d)
    const cpu = (data[0].usl-avgParameter)/ (3*estimated_s_d)
    const cpl = (avgParameter-data[0].lsl)/(3*estimated_s_d)
    const cpk = Math.min(cpu,cpl)


  


  // Function to calculate standard deviation
function standardDeviation(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map(value => (value - mean) ** 2);
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// Calculate actual standard deviation
const actual_s_d = standardDeviation(parameters);
const pp = (data[0].usl-data[0].lsl) - (6 * actual_s_d)
const ppu = (data[0].usl-avgParameter)/ (3*actual_s_d)
const ppl = (avgParameter-data[0].lsl)/(3*actual_s_d)
const ppk = Math.min(ppu,ppl)



    

    
  const chartData = {
    data:{
      min:individual_LCL,
      max:individual_UCL,
      mid:avgParameter,
      cp:cp,
      cpk:cpk,
      pp:pp,
      ppk:ppk,
      type:data[0].type,
    },
    series: [
      {
        name: `${data[0].SeriesName}`,
        data: formattedParameters,

      }
    ],
    options: {
      chart: {
        height: 150,
        type: `${data[0].ChartType}`,
        stacked: false
      },
      style: { height: 130 },
      xaxis: {
        categories: records.recordset.map(record => new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.created_at)))

      },
      yaxis: [
        {
          min:individual_LCL.toFixed(1)-1,
          max:individual_UCL.toFixed(1)+2,
      
          title: {
            text: `${data[0].SeriesName}`
          },
        },
        {
          opposite: false,
          title: {
            text: `${data[0].YAxisTitle}`,
          },
        },
      ],
      markers: {
        size: 8,
    },
      annotations: {
        yaxis: [
          {
            y: individual_UCL.toFixed(2),
            borderColor: '#FF0000',
         
            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text: `${individual_UCL.toFixed(2)}`
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
          {
            y: avgParameter.toFixed(2),
            borderColor: '#008000',
      
            strokeDashArray: 0,
            label: {
                borderColor: '#008000',
                style: {
                    color: '#fff',
                    background: '#008000'
                },
                text: `${avgParameter.toFixed(2)}`
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
          {
            y: individual_LCL.toFixed(2),
            borderColor: '#FF0000',
   
            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text: `${individual_LCL.toFixed(2)}`
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
        ]
      }
    }
  };


  

  // const parameters = records.recordset.map(record => parseFloat(record.parameter));
    

    
   
  const chartData2 = {
    data:{
      min:range_LUL,
      max:range_UCL,
      mid:avgAbsoluteDifference,
    },
    series: [
      {
        name: `${data[0].SeriesName}`,
        data: formattedabsolute
      }
    ],
    options: {
      chart: {
        height: 100,
        type: `${data[0].ChartType}`,
        stacked: false
      },
      style: { height: 100 },
      xaxis: {
        categories: records.recordset.map(record => new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.created_at)))

      },
      yaxis: [
        {
          min:range_LUL - 1,
          max:range_UCL + 2,
          title: {
            text: `${data[0].SeriesName}`
          },
        },
        {
          opposite: false,
          title: {
            text: `${data[0].YAxisTitle}`,
          },
        },
      ],
      markers: {
        size: 8,
    },
    annotations: {
      yaxis: [
        {
          y: range_UCL.toFixed(2),
          borderColor: '#FF0000',
     
          strokeDashArray: 0,
          label: {
            borderColor: '#FF0000',
            style: {
              color: '#fff',
              background: '#FF0000'
            },
            text:  `${range_UCL.toFixed(2)}`,
          },
          zIndex: 1000,
          offsetY: -10 // Adjust the offsetY value as needed
        },
        {
          y: avgAbsoluteDifference.toFixed(2),
          borderColor: '#008000',
     
          strokeDashArray: 0,
          label: {
            borderColor: '#008000',
            style: {
              color: '#fff',
              background: '#008000'
            },
            text: `${avgAbsoluteDifference.toFixed(2)}`,
          },
          zIndex: 1000,
          offsetY: -10 // Adjust the offsetY value as needed
        },
        {
          y: range_LUL.toFixed(2),
          borderColor: '#FF0000',
       
          strokeDashArray: 0,
          label: {
            borderColor: '#FF0000',
            style: {
              color: '#fff',
              background: '#FF0000'
            },
            text: `${range_LUL.toFixed(2)}`,
          },
          zIndex: 1000,
          offsetY: -10 // Adjust the offsetY value as needed
        }
      ]
    }
    
    }
  };

    // Send the result as JSON
    res.json({ chartData, chartData2 });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});




app.get('/get_chart_details_info/:id', async (req, res) => {
  const chartId = req.params.id;

  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query data from the ChartData table using the provided ID
    const result = await request.query(`SELECT TOP 1 * FROM ChartData WHERE id = ${chartId};`);
    const data = result.recordset;

    if (data.length === 0) {
      res.status(404).send('Chart data not found');
      return;
    }

    

    const record_paramter = await request.query(`
        SELECT parameter
        FROM device 
        WHERE parameter_name = '${data[0].parameterName}' AND device_number1 = '${data[0].part_number}'
`);

const all_parameters = record_paramter.recordset.map(record => parseFloat(record.parameter));



    // Query the database to fetch the last 20 records for the specified device ID
    const records = await request.query(`
    SELECT  AVG(CAST(parameter AS float)) AS parameter_avg, MIN(parameter) AS parameter_min, MAX(parameter) AS parameter_max, MIN([created_at]) AS created_at 
    FROM (
        SELECT parameter, [created_at], ROW_NUMBER() OVER (ORDER BY [created_at]) AS row_num
        FROM device 
        WHERE parameter_name = '${data[0].parameterName}' AND device_number1 = '${data[0].part_number}'
    ) AS t
    GROUP BY FLOOR((row_num - 1) / 5)
    HAVING COUNT(*) = 5;
`);


const parameters = records.recordset.map(record => parseFloat(record.parameter_avg));
const formattedParameters = parameters.map(value => value.toFixed(2));

const avgParameter = parameters.reduce((acc, val) => acc + val, 0) / parameters.length;

const parameterMaxValues = records.recordset.map(record => parseFloat(record.parameter_max));
const parameterMinValues = records.recordset.map(record => parseFloat(record.parameter_min));

// Calculate moving ranges
const absoluteDifferences = parameterMaxValues.map((max, index) => max - parameterMinValues[index]);

const formattedabsoluteDifferences = absoluteDifferences.map(value => value.toFixed(2));

// Calculate the sum of absolute differences
const sumOfDifferences = absoluteDifferences.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

// Calculate the average
const avgAbsoluteDifference = sumOfDifferences / absoluteDifferences.length;

// Calculate individual UCL and LCL




const individual_UCL = avgParameter + (0.577 * avgAbsoluteDifference)
const individual_LCL = avgParameter - (0.577 * avgAbsoluteDifference)

// Calculate range UCL and LCL
const range_UCL = 2.114 * avgAbsoluteDifference
const range_LUL = 0




const estimated_s_d = avgAbsoluteDifference / 2.326
const cp = (data[0].usl-data[0].lsl)/(6*estimated_s_d)
const cpu = (data[0].usl-avgParameter)/(3*estimated_s_d)
const cpl = (avgParameter-data[0].lsl)/(3*estimated_s_d)
const cpk = Math.min(cpu,cpl)




// Function to calculate standard deviation
function standardDeviation(values) {
const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
const squaredDifferences = values.map(value => (value - mean) ** 2);
const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / (values.length - 1);
return Math.sqrt(variance);
}

// Calculate actual standard deviation
const actual_s_d = standardDeviation(all_parameters);
const pp = (data[0].usl-data[0].lsl) - (6 * actual_s_d)
const ppu = (data[0].usl-avgParameter)/ (3*actual_s_d)
const ppl = (avgParameter-data[0].lsl)/(3*actual_s_d)
const ppk = Math.min(ppu,ppl)





    

    
  const chartData = {
    data:{
      min:individual_LCL,
      max:individual_UCL,
      mid:avgParameter,
       cp:cp,
      cpk:cpk,
      pp:pp,
      ppk:ppk,
      type:data[0].type
    },
    series: [
      {
        name: `${data[0].SeriesName}`,
        data:formattedParameters 
        ,
      }
    ],
    options: {
      chart: {
        height: 150,
        type: `${data[0].ChartType}`,
        stacked: false
      },
      style: { height: 130 },
      xaxis: {
        categories: records.recordset.map(record => new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.created_at)))

      },
      yaxis: [
        {
          min:individual_LCL - 1,
          max:individual_UCL + 2,
    
          title: {
            text: `${data[0].SeriesName}`
          },
          labels: { show: true }
        },
        {
          opposite: false,
          title: {
            text: `${data[0].YAxisTitle}`,
          },
        },
      ],
      markers: {
        size: 8,
    },
      annotations: {
        yaxis: [
          {
            y: individual_UCL.toFixed(2),
            borderColor: '#FF0000',
  
            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text:  `${individual_UCL.toFixed(2)}`,
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
           
        },
          {
            y: avgParameter.toFixed(2),
            borderColor: '#008000',
    
            strokeDashArray: 0,
            label: {
                borderColor: '#008000',
                style: {
                    color: '#fff',
                    background: '#008000'
                },
                text: `${avgParameter.toFixed(2)}`,
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
          {
            y: individual_LCL.toFixed(2),
            borderColor: '#FF0000',

            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text: `${individual_LCL.toFixed(2)}`,
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
        ]
      }
    }
  };


  

  // const parameters = records.recordset.map(record => parseFloat(record.parameter));
    

    
   
  const chartData2 = {
    data:{
      min:range_LUL,
      max:range_UCL,
      mid:avgAbsoluteDifference,
    },
    series: [
      {
        name: `${data[0].SeriesName}`,
        data: formattedabsoluteDifferences
      }
    ],
    options: {
      chart: {
        height: 100,
        type: `${data[0].ChartType}`,
        stacked: false
      },
      style: { height: 100 },
      xaxis: {
        categories: records.recordset.map(record => new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.created_at)))

      },
      yaxis: [
        {
          min:range_LUL-1,
          max:range_UCL+2,
        
          title: {
            text: `${data[0].SeriesName}`
          },
          labels: { show: true }
        },
        {
          opposite: false,
          title: {
            text: `${data[0].YAxisTitle}`,
          },
        },
      ],
      markers: {
        size: 8,
    },
      annotations: {
        yaxis: [
          {
        
            y: range_UCL.toFixed(2),
            borderColor: '#FF0000',
      
            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text:  `${range_UCL.toFixed(2)}`
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
          {
            y: avgAbsoluteDifference.toFixed(2),
            borderColor: '#008000',
  
            strokeDashArray: 0,
            label: {
                borderColor: '#008000',
                style: {
                    color: '#fff',
                    background: '#008000'
                },
                text: `${avgAbsoluteDifference.toFixed(2)}`
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
          {
            y: range_LUL.toFixed(2),
            borderColor: '#FF0000',
 
            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text: `${range_LUL.toFixed(2)}`
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
        ]
      }
    }
  };

    // Send the result as JSON
    res.json({ chartData, chartData2 });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});



app.get('/chart', async (req,res)=>{
  const chartData1 = {
    series: [
      {
        name: "Individual Values",
        data:  [8, 2, 4, 5, 3, 2, 3, 4]
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        stacked: false,
      },
      xaxis: {
        categories:  ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '1:00'],
      },
      yaxis: [
        {
          title: {
            text: `Individual Values`,
          },
        },
      ],
      markers: {
        size: 8,
    },
      annotations: {
        yaxis: [
          {
            y: 7, // Set the threshold for the line
            borderColor: "#FF0000",
            borderWidth: 5,
            label: {
              borderColor: "#FF0000",
              style: {
                color: "#fff",
                background: "#FF0000",
              },
              text: "Upper limit",
            },
          },
          {
            y: 5, // Set the threshold for the line
            borderColor: "#008400",
            borderWidth: 5,
            label: {
              borderColor: "#008400",
              style: {
                color: "#fff",
                background: "#008400",
              },
              text: "online",
            },
          },
          {
            y: 2.5,
            borderColor: '#FF7276',
            borderWidth: 5,
            strokeDashArray: 0,
            label: {
                borderColor: '#FF0000',
                style: {
                    color: '#fff',
                    background: '#FF0000'
                },
                text: 'lower Limit'
            },
            zIndex: 1000,
            offsetY: -10 // Adjust the offsetY value as needed
        },
        ],
      },
    },
  };

  res.json(chartData1)
})


app.get('/get_device/:id', async (req, res) => {
  const chartId = req.params.id;

  try {
    // Connect to the database
    await sql.connect(config);

    // Create a new request object
    const request = new sql.Request();

    // Query data from the ChartData table using the provided ID
    const result = await request.query(`SELECT TOP 1 * FROM ChartData WHERE id = ${chartId};`);
    const data = result.recordset;

    if (data.length === 0) {
      res.status(404).send('Chart data not found');
      return;
    }

    // Fetch count of records within the range of lower and upper limits
    const avgCountResult = await request.query(`
      SELECT 
        parameter_name,
        parameter,
        COUNT(*) AS total_count,
        SUM(CASE WHEN parameter BETWEEN ${data[0].lower_limit} AND ${data[0].upper_limit} THEN 1 ELSE 0 END) AS in_range_count
      FROM device 
      WHERE parameter_name = '${data[0].parameterName}' 
        AND device_number1 = '${data[0].part_number}'
      GROUP BY parameter_name, parameter;
    `);

    // Fetch count of out-of-range records
    const outOfRangeCountResult = await request.query(`
      SELECT 
        parameter_name,
        parameter,
        COUNT(*) AS out_of_range_count
      FROM device 
      WHERE parameter_name = '${data[0].parameterName}' 
        AND device_number1 = '${data[0].part_number}'
        AND (parameter < ${data[0].lower_limit} OR parameter > ${data[0].upper_limit})
      GROUP BY parameter_name, parameter;
    `);

    // Send the counts as JSON
    res.json({ avgCountResult, outOfRangeCountResult });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close().catch(err => console.error('Error closing the connection:', err));
  }
});



// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Error handling for server
server.on('error', (error) => {
    console.error('Server error:', error);
});
