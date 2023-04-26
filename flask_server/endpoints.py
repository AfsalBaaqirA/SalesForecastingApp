import uuid
from flask_pymongo import pymongo
from flask import jsonify, request
from dotenv import load_dotenv
from bcrypt import hashpw, gensalt
from werkzeug.datastructures import MultiDict
import os
from math import sqrt
import pandas as pd
import warnings
from pmdarima import auto_arima
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error

load_dotenv()

MONGO_DB_URL = os.getenv('MONGO_DB_URL')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME')

mongo_client = pymongo.MongoClient(MONGO_DB_URL)
mongo_db = mongo_client.get_database(MONGO_DB_NAME)
accounts = pymongo.collection.Collection(mongo_db, 'accounts')
sessions = pymongo.collection.Collection(mongo_db, 'sessions')
print("MongoDB connected")

def api_endpoints(app):

    @app.route('/api/signup', methods=['POST'])
    def signup():
        try:
            data = request.get_json()
            name = data.get('name')
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            phone = data.get('phone')
            hashed_password = hashpw(password.encode('utf-8'), gensalt())
            query = {
                'email': email,
            }
            query2 = {
                'username': username,
            }
            account = accounts.find_one(query)
            if account:
                status = {
                    'status': '400',
                    'message': 'Email already exists'
                }
            elif accounts.find_one(query2):
                status = {
                    'status': '400',
                    'message': 'Username already exists'
                }
            else:
                accounts.insert_one(
                    {'name': name, 'username': username, 'password': hashed_password, 'email': email, 'phone': phone, 'predictionsArray': []})
                status = {
                    'status': '200',
                    'message': 'Account created successfully'
                }
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }

        return jsonify({'status': status})

    @app.route('/api/signin', methods=['POST'])
    def signin():
        token = None
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            hashed_password = hashpw(password.encode('utf-8'), gensalt())
            query = {
                'username': username,
            }
            account = accounts.find_one(query)
            if account and account['password'] and hashed_password:
                status = {
                    'status': '200',
                    'message': 'Login successful'
                }
                session = sessions.find_one(query)
                if session:
                    token = uuid.uuid4().hex
                    print(token)
                    sessions.update_one(
                        query, {'$set': {'sessionToken': token}})
                else:
                    token = uuid.uuid4().hex
                    print(token)
                    sessions.insert_one(
                        {'sessionToken': token, 'username': username})
            else:
                status = {
                    'status': '400',
                    'message': 'Invalid credentials'
                }
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }
        response = jsonify({'status': status, 'sessionToken': token})
        return response

    @app.route('/api/getPredictions/<sessionToken>', methods=['GET'])
    def getPredictions(sessionToken):
        try:
            query = {
                'sessionToken': sessionToken
            }
            session = sessions.find_one(query)
            if session:
                username = session['username']
                query = {
                    'username': username
                }
                account = accounts.find_one(query)
                if account:
                    predictions = account['predictionsArray']
                    status = {
                        'status': '200',
                        'message': 'Success'
                    }
                    response = jsonify(
                        {'status': status, 'predictions': predictions})
                    return response
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }
        response = jsonify({'status': status})
        return response
    
    
    @app.route('/api/deletePrediction/<sessionToken>', methods=['POST'])
    def deletePrediction(sessionToken):#change
        try:
            data = request.get_json()
            predictionId = data.get('predictionId')
            query = {
                'sessionToken': sessionToken
            }
            session = sessions.find_one(query)
            if session:
                username = session['username']
                query = {
                    'username': username
                }
                account = accounts.find_one(query)
                if account:
                    predictions = account['predictionsArray']
                    for prediction in predictions:
                        if prediction['predictionId'] == predictionId:
                            predictions.remove(prediction)
                            break
                    accounts.update_one(
                        query, {'$set': {'predictionsArray': predictions}})
                    
            status = {
                'status': '200',
                'message': 'Deleted successfully'
            }
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }
        response = jsonify({'status': status})
        return response

    @app.route('/api/predict-data/<sessionToken>', methods=['POST'])
    def predictData(sessionToken):
        response_data = None
        status = None
        try:
            data = MultiDict(request.form)
            periodicity = data.get('periodicity')
            forecastCount = int(data.get('forecastCount'))
            file = request.files.get('file')
            predictionName = data.get('predictionName')
            if file:
                file.save('uploads/'+file.filename)
                filepath = 'D:/Projects/SalesForecastingApp/flask_server/uploads/'+file.filename
                data = pd.read_csv(filepath, index_col = 0, parse_dates = True)

                warnings.filterwarnings("ignore")

                m = None

                if periodicity == 'Daily':
                    m = 1
                elif periodicity == 'Weekly':
                    m = 7
                elif periodicity == 'Monthly':
                    m = 12
                elif periodicity == 'Yearly':
                    m = 1

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

                # Train the model on the full dataset
                model = SARIMAX(data.iloc[:, 0],
                                order=stepwise_fit.order,
                                seasonal_order=stepwise_fit.seasonal_order)
                result = model.fit()

                # Forecast for the next n years
                forecast = result.predict(start=len(data),
                                        end=len(data) + forecastCount * m,
                                        typ='levels').rename('Forecast')
                
                forecast_df = forecast.to_frame()
                forecast_df.reset_index(level=0, inplace=True)
                forecast_df.columns = ['PredictedDate', 'PredictedValue']
                print(data)
                print(forecast_df)
                forecast_df['PredictedDate'] = pd.to_datetime(forecast_df['PredictedDate']).dt.strftime('%Y-%m-%d')
                list1 = forecast_df.to_dict('records')

                data.reset_index(level=0, inplace=True)
                data.columns = ['Date', 'Value']
                print(data)
                data['Date'] = pd.to_datetime(data['Date']).dt.strftime('%Y-%m-%d')
                list2 = data.to_dict('records')

                predictedDate = []
                predictedValue = []

                for d in list1:
                    predictedDate.append(d["PredictedDate"])
                    predictedValue.append(d["PredictedValue"])
                
                date = []
                value = []

                for d in list2:
                    date.append(d["Date"])
                    value.append(d["Value"])

                response_data = {
                    'predictionId': uuid.uuid4().hex,
                    'predictionName': predictionName,
                    'date': date,
                    'value': value,
                    'predictedDate': predictedDate,
                    'predictedValue': predictedValue,
                    'rmse': rmse_val,
                    'mae': mae_val,
                    'mse': mse_val
                }

                query = {
                    'sessionToken': sessionToken,
                }
                session = sessions.find_one(query)
                if session:
                    username = session['username']
                    query = {
                        'username': username,
                    }
                    account = accounts.find_one(query)
                    if account:
                        predictionsArray = account['predictionsArray']
                        predictionsArray.append(response_data)
                        account['predictionsArray'] = predictionsArray
                        accounts.update_one(query, {'$set': account})
                    
                status = {
                    'status': '200',
                    'message': 'Prediction generated successfully'
                }

            else:
                status = {
                    'status': '400',
                    'message': 'File not uploaded'
                }
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }
        response = jsonify({'data': response_data, 'status': status})
        return response

    @app.route('/api/validate', methods=['POST'])
    def validate():
        try:
            token = request.get_json()['sessionToken']
            query = {
                'sessionToken': token,
            }
            session = sessions.find_one(query)
            if session:
                status = {
                    'status': '200',
                    'message': 'Valid'
                }
            else:
                status = {
                    'status': '400',
                    'message': 'Invalid'
                }
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }
        response = jsonify({'status': status})
        return response

    @app.route('/api/invalidate', methods=['POST'])
    def invalidate():
        try:
            token = request.get_json()['sessionToken']
            query = {
                'sessionToken': token,
            }
            session = sessions.find_one(query)
            if session:
                sessions.delete_one(query)
                status = {
                    'status': '200',
                    'message': 'Invalidated'
                }
            else:
                status = {
                    'status': '400',
                    'message': 'Invalid'
                }
        except Exception as e:
            status = {
                'status': '400',
                'message': str(e)
            }
        response = jsonify({'status': status})
        return response
