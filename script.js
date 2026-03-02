
console.log("JavaScript file loaded successfully!");

// Get a reference to the HTML form element using its ID.
const predictionForm = document.getElementById('prediction-form');

predictionForm.addEventListener('submit', function(event) {
  
    event.preventDefault();

     const formData = new FormData(predictionForm);
      const data = Object.fromEntries(formData.entries()); // conver into JS obj --> key value

    for (const key in data) {
        // parseFloat can handle both integers (like '50') and decimals (like '33.6')
        data[key] = parseFloat(data[key]);
    }
    console.log("Gathered and cleaned form data:", data);
    const jsonPayload = JSON.stringify(data);
    console.log("Constructed JSON Payload:", jsonPayload);

   
    fetch('http://127.0.0.1:5000/predict', {
        method: 'POST', 
        headers: {
            // This header is crucial. It tells the server the body of our request is JSON.
            'Content-Type': 'application/json'
        },
        // The 'body' of the request is our serialized JSON payload.
        body: jsonPayload
    })
    .then(response => {
        // .then() is called when the server sends a response back.
        // First, check if the response was successful (HTTP status code 200-299).
        if (!response.ok) {
            // If the server response was not ok, we create our own error to be
            // caught by the .catch() block, so we can handle it in one place.
            throw new Error(`Server responded with an error: ${response.status}`);
        }
        // If the response is ok, we parse the JSON body of the response.
        // response.json() also returns a Promise, which is why we need another .then().
        return response.json();
    })
    .then(predictionData => {
        // This .then() is called when the response.json() Promise resolves.
        // 'predictionData' is now the JavaScript object sent back from our Flask API.
        console.log("Success! Received prediction from API:", predictionData);

         // Step 1: Get a reference to our result container div.
        const resultContainer = document.getElementById('result-container');

        // Step 2: Extract the data we want to display from the response object.
        const label = predictionData.prediction_label;
        const confidenceNonDiabetic = (predictionData.confidence_scores['Non-Diabetic'] * 100).toFixed(2);
        const confidenceDiabetic = (predictionData.confidence_scores['Diabetic'] * 100).toFixed(2);

        // Step 3: Build the HTML string to display the result.
        // We use template literals (backticks ``) to easily construct the string.
        const resultHTML = `
            <h2>Prediction Result</h2>
            <p><strong>Outcome:</strong> ${label}</p>
            <p><strong>Confidence Scores:</strong></p>
            <ul>
                <li>Non-Diabetic: ${confidenceNonDiabetic}%</li>
                <li>Diabetic: ${confidenceDiabetic}%</li>
            </ul>
        `;

        // Step 4: Inject the HTML into our result container.
        resultContainer.innerHTML = resultHTML;
        resultContainer.style.display = "block";

        // Step 5 (Enhancement): Change the text color based on the prediction.
        if (label === 'Diabetic') {
            resultContainer.style.color = 'red';
        } else {
            resultContainer.style.color = 'green';
        }
    })
    .catch(error => {
        // The .catch() block is executed if there's a network error (e.g., server is down)
        // or if we threw an error in the first .then() block.
        console.error("Error communicating with the API:", error);
        
    });
    
   
});