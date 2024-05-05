import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import Navbar from './Navbar';
import './MyStyles.css'; 

const HistoryComponent = () => {
  const { username } = useParams();
  const [chartInstance, setChartInstance] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalNutrients, setTotalNutrients] = useState(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/get_history`,
          {
            Id: username
          }
        );

        console.log(username);
        console.log(response);
        setApiData(response.data);
        setIsLoading(false);

        // Calculate total nutrients
        const totalProtein = response.data.reduce(
          (total, item) => total + item.nutrition.protein,
          0
        );
        const totalFat = response.data.reduce(
          (total, item) => total + item.nutrition.fat,
          0
        );
        const totalCarb = response.data.reduce(
          (total, item) => total + item.nutrition.carb,
          0
        );
        const totalCalories = response.data.reduce(
          (total, item) => total + item.nutrition.calorie,
          0
        );

        setTotalNutrients({
          protein: totalProtein,
          fat: totalFat,
          carb: totalCarb,
          calories: totalCalories,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); 

  useEffect(() => {
    if (totalNutrients) {
      createHistogram();
    }
  }, [totalNutrients]);

  const createHistogram = () => {

    if (chartInstance) {
        chartInstance.destroy();
      }

    const ctx = document.getElementById('histogramChart').getContext('2d');
    const newChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Protein', 'Fat', 'Carb'],
        datasets: [
          {
            data: [
              totalNutrients.protein,
              totalNutrients.fat,
              totalNutrients.carb
            //   totalNutrients.calories,
            ],
            backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
    setChartInstance(newChartInstance);
  };

  return (
    <div style={{ maxHeight: '100vh', overflowY: 'auto' }}> 
      <Navbar username={username} />
      <p class="space-before-text"><h2 >User History Details</h2></p>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'rem' }}>
          <div style={{ overflowX: 'auto', padding: '2rem' }}>
          <h3>For current month</h3>
          <table className='history-table'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Protein</th>
                <th>Fat</th>
                <th>Carb</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {apiData.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.name}</td>
                  <td>{item.nutrition.protein}</td>
                  <td>{item.nutrition.fat}</td>
                  <td>{item.nutrition.carb}</td>
                  <td>{item.nutrition.calorie}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div style={{ padding: '2rem' }}>
            <canvas id="histogramChart" width="400" height="400"></canvas>
          </div>
        </div>
      )}
    <div align='center'>
          {totalNutrients && (
          
          <p style={{fontSize : '1.1rem' }}><h4>Total Calories : {' '}
              {totalNutrients.calories}
              </h4>
          </p>
            
          )}
      </div>
    </div>
  );
};

export default HistoryComponent;
