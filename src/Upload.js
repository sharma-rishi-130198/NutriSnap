import React, { useState, useEffect } from 'react';
import { Input, Button, Heading, Text } from '@aws-amplify/ui-react';
import axios from 'axios'
import Chart from 'chart.js/auto';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import './MyStyles.css'; 

let myChart = null;

function Upload({ username2, fromLogin }) {

  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [nutritionData, setNutritionData] = useState(null);

  const storedUsername = localStorage.getItem('username');
  const [username, setUsername] = useState(storedUsername || '');

  useEffect(() => {
    if (fromLogin == true) {
      console.log('FROM LOGIN = ',fromLogin);
      console.log('USERNAME = ',username2);
      const newUsername = username2;

      setUsername(newUsername);
      // Save the username to local storage
      localStorage.setItem('username', newUsername);
    }
  }, [fromLogin, location.state]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleQuantityChange = (event) => {
    setQuantity(parseInt(event.target.value, 10) || 0); // Convert input to an integer
  };
  const handleUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result.split(',')[1]; // Get the base64 string
        console.log(base64String)
        sendImage(base64String);
      };
      reader.readAsDataURL(selectedFile);
    }

    alert('File Uploaded');

    // hardcode values to test piechart without backend
    // setNutritionData({
    //   protein: '33',
    //   carbs: '22',
    //   fat: '17',
    //   calorie: '223'
    // });

  };

  const sendImage = (base64String) => {

  console.log(quantity, username);
    axios.post(`${process.env.REACT_APP_API_URL}/get_calories`, {
        Id: username,
        base64String: base64String,
        qty: quantity
        }).then(response => {
            console.log(response);

            // Set the response data in state
            const firstItemName = response.data.name;
            setItemName(firstItemName);
            setNutritionData({
              protein: response.data.nutrition.protein,
              carbs: response.data.nutrition.carb,
              fat: response.data.nutrition.fat,
              calorie: response.data.nutrition.calorie
            });
        }).catch(error => {
            console.log(error)
            // setIsLoading(false);
        });

  };

  // to create pie chart
  useEffect(() => {
    console.log('Received username in Upload:', username);
    if (nutritionData) {
      createPieChart();
    }
  }, [nutritionData]);

  const createPieChart = () => {

    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById('pieChart').getContext('2d');
    const newChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [
          {
            data: [nutritionData.protein, nutritionData.carbs, nutritionData.fat],
            backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
          },
        ],
      },
    });
    setChartInstance(newChartInstance);
  };
  

  return (
    <div>
    {!fromLogin && <Navbar username={username} />}
    <br></br>
    <div className="Upload-container">
    {/* <p>Received username: {username}</p> */}
      <p style={{ textAlign : 'center', fontSize : '1.25rem' }}><h2 >Food Image Scanner</h2></p>
      <br></br>
      <p style={{fontSize : '0.7rem' }}><h2 ><i>Upload Image:</i></h2></p>

      <Input type="file" onChange={handleFileChange} />

      <div className="quantity-input">
        <label>
        <p style={{fontSize : '0.7rem' }}><h2><i>Quantity:</i></h2></p>
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </label>
      </div>
      <br></br>
      <Button align = 'center' onClick={handleUpload}>Get Data</Button>
      {/* {itemName && <Text>Item Name: {itemName}</Text>} */}
      <div className="item-info" align='center'>
        <p style={{fontSize : '1.1rem' }}><h4>{itemName && <Text className="item-name">Your Food: {itemName}</Text>}</h4></p>
      </div>

      <div className="chart-container">
        <canvas id="pieChart" width="10" height="10"></canvas>
      </div>
      {nutritionData && (
        <div className="calories-info" align='center'>
          <p style={{fontSize : '1.1rem' }}><h4><Text>Calories: {nutritionData.calorie}</Text></h4></p>
        </div>
      )}
    </div>
    </div>
  );
}

export default Upload;
