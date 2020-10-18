<h1 align="center">ExpressJS - Wall-E Restful API</h1>

Wall-E is a Restful API for payment gateway via web. It has a clear and consistent API and fully unit tested. [More about Express](https://en.wikipedia.org/wiki/Express.js)

## Built With

[![Express.js](https://img.shields.io/badge/Express.js-4.17.1-orange.svg?style=rounded-square)](https://expressjs.com/en/starter/installing.html)
[![Node.js](https://img.shields.io/badge/Node.js-v.12.18.2-green.svg?style=rounded-square)](https://nodejs.org/)

## Requirements

1. <a href="https://nodejs.org/en/download/">Node Js</a>
2. Node_modules
3. <a href="https://www.getpostman.com/">Postman</a>
4. Web Server (ex. localhost)

## How to run the app ?

1. Open app's directory in CMD or Terminal
2. Type `npm install`
3. Make new file a called **.env**, set up first [here](#set-up-env-file)
4. Turn on Web Server and MySQL can using Third-party tool like xampp, etc.
5. Create a database with the name walle, and Import file sql to **phpmyadmin**
6. Open Postman desktop application or Chrome web app extension that has installed before
7. Choose HTTP Method and enter request url.(ex. localhost:3001/)
8. You can see all the end point [here](#end-point)

## Set up .env file

Open .env file on your favorite code editor, and copy paste this code below :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=walle

PORT=3001
IP=127.0.0.1

USER=Your Email
PASS=Your Password
```

## End Point

**1. GET**

- `/users/user?sort=value&page=value&limit=value`(Get all user)
- `/users/user/name?search=value&page=value&limit=value`(Get user by name)
- `/users/:id`(Get user by Id)
- `/users/pin/exist/:user_id`(Check if pin length > 0 in database)
- `/users/pin/:user_id`(check if the input pin is the same as the pin in database)

    - `{ "user_pin": "123456" }`

- `/transfer/:id`(Get user transfer by id)
- `/transfer/balance-statistic/:id`(Get balance statistic)
- `/notification/:id?limit=5`(Get user notification)
- `/notification/count-unread/:id`(Get count unread notification)

**2. POST**

- `/users/login`(Post login user)

    - `{ "user_email": "romulan@gmail.com", "user_password": "romulans"}`

- `/users/register`(Post register user)

    - `{ "user_email": romulan@gmail.com, "user_password": "romulans", "confirm_password": "romulans", "user_first_name": "Marcus", "user_last_name": "Wong", "user_phone": "08111111111"}`

- `/users/email`(Post activation via email)

    - `{ "user_email": "romulan@gmail.com" }`

- `/users/forgot`(Post forgot password via email)

    - `{ "user_email": "romulan@gmail.com" }`

- `/transfer/`(Post transfer)

    - `{ "user_id_a": "7", "user_id_b": "1", "user_pin": "123456", "transfer_amount": "6000" }`

- `/payment/`(Post payment)

    - `{ "user_id": "1", "history_nominal": "150000" }`

- `/payment/midtrans-notification`(Post notification midtrans)

- `/payment/top-up`(Post manual payment)

    - `{ "user_id": "2", "history_nominal": "300000" }`

**3. PATCH**

- `/users/activate?keys=value`(Patch to activate user)
- `/users/change?keys=value`(Patch to change password)

    - `{ "user_password": "Mamumi12", "confirm_password": "Mamumi12"}`

- `/users/patch/password/:user_id`(Patch password)

    - `{ "old_password": "Mamumi123", "user_password": "Mamumi12", "confirm_password": "Mamumi12"}`

- `/users/patch/profile/:user_id`(Patch first name, last name and phone number)

    - `{ "user_first_name": "Marcus", "user_last_name": "Wong", "user_phone": "08111111111"}`

- `/users/patch/image/:user_id`(Patch image)

    - `{ "user_picture": "carl.png" }`

- `/users/delete/image/:user_id`(Delete image)

- `/users/patch/pin/:user_id`(Patch pin)

    - `{ "user_pin": "123456" }`

## Postman link

Link: https://documenter.getpostman.com/view/12323107/TVRhcUsT

