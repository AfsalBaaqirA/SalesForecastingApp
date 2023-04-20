import json
from math import sqrt
from flask import jsonify
import pandas as pd
import warnings
from pmdarima import auto_arima
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score

def predict(filepath, periodicity, forecastCount, predictionName):
    response = {}
    status = {}
    try:
        data = pd.read_csv(filepath, index_col=0, parse_dates=True)

        warnings.filterwarnings("ignore")

        m = None

        if periodicity == 'Daily':
            m = 1
        elif periodicity == 'Weekly':
            m = 7
        elif periodicity == 'Monthly':
            m = 12
        elif periodicity == 'Yearly':
            m = 365

        # Fit auto_arima function to the dataset
        stepwise_fit = auto_arima(data.iloc[:, 0],
                                start_p=0, start_q=0,
                                max_p=3, max_q=3, m=m,
                                start_P=0, seasonal=True,
                                d=1, D=1, trace=False,
                                error_action='ignore',
                                suppress_warnings=True,
                                stepwise=True)

        # Split data into train / test sets
        train = data.iloc[:len(data)-12]
        test = data.iloc[len(data)-12:]

        model = SARIMAX(train.iloc[:, 0],
                        order=stepwise_fit.order,
                        seasonal_order=stepwise_fit.seasonal_order)

        result = model.fit()

        start = len(train)
        end = len(train) + len(test) - 1

        # Predictions for one-year against the test set
        predictions = result.predict(start, end,
                                    typ='levels').rename("Predictions")

        # Calculate mean squared error
        mse_val = mean_squared_error(test.iloc[:, 0], predictions)

        rmse_val = sqrt(mse_val)

        mae_val = mean_absolute_error(test.iloc[:, 0], predictions)

        accuracy = accuracy_score(test.iloc[:, 0], predictions)

        # Train the model on the full dataset
        model = SARIMAX(data.iloc[:, 0],
                        order=stepwise_fit.order,
                        seasonal_order=stepwise_fit.seasonal_order)
        result = model.fit()

        # Forecast for the next 3 years
        forecast = result.predict(start=len(data),
                                end=len(data) + forecastCount * m,
                                typ='levels').rename('Forecast')
        
        forecast_df = forecast.to_frame()
        forecast_df.reset_index(level=0, inplace=True)
        forecast_df.columns = ['PredictionDate', 'PredictedValue']
        forecast_df['PredictionDate'] = forecast_df['PredictionDate'].dt.strftime('%Y-%m-%d')
        list1 = forecast_df.to_dict('records')

        data.reset_index(level=0, inplace=True)
        data.columns = ['Date', 'Value']
        data['Date'] = data['Date'].dt.strftime('%Y-%m-%d')
        list2 = data.to_dict('records')

        predictionDate = []
        predictedValue = []

        for d in list1:
            predictionDate.append(d["PredictionDate"])
            predictedValue.append(d["PredictedValue"])
        
        date = []
        value = []

        for d in list2:
            date.append(d["Date"])
            value.append(d["Value"])

        response_data = {
            'predictionName': predictionName,
            'date': date,
            'value': value,
            'predictionDate': predictionDate,
            'predictedValue': predictedValue,
            'rmse': rmse_val,
            'mae': mae_val,
            'mse': mse_val,
            'accuracy': accuracy
        }

        status = {
            'status': '200',
            'message': 'Prediction generated successfully'
        }


    except Exception as e:
        status = {
            'status': '400',
            'message': str(e)
        }

    return jsonify({'status': status, 'data': json.dumps(response)})

print(predict('D:/Projects/SalesForecastingApp/flask_server/uploads/Electric_Production.csv', 'Monthly', 3))
