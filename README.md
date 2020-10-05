"# Wall-e-Express" 
<h1 align="center">ExpressJS - Wall-E Restful API</h1>

Wall-E is a Restful API for payment gateway web. [More about Express](https://en.wikipedia.org/wiki/Express.js)

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

USER=wallecorps@gmail.com
PASS=marsupilami12
```

## End Point

**1. GET**

- `/users/login`(Login user)
- `/users/register`(Register user)
- `/users/email`(Post activation via email)
- `/users/activate`(Patch to activate user)
- `/users/forgot`(Post forgot password via email)
- `/users/change`(Patch to change password)
- `/users/user`(Get all user)
- `/users/user/name`(Get user by name)
- `/users/:id`(Get user by Id)
- `/users/patch/password/:user_id`(Patch password)
- `/users/patch/profile/:user_id`(Patch first name, last name and phone number)
- `/users/patch/image/:user_id`(Patch image)
- `/users/pin/exist/:user_id`(Check if pin length > 0 in database)
- `/users/pin/:user_id`(check if the input pin is the same as the pin in database)
- `/users/patch/pin/:user_id`(Patch pin)
- `/users/deactivate/:user_id`(Deactivate user)

- `/users/:id`(Get user by id)

**2. POST**

- `/product/` (Post product)

  - `{ "category_id": 2, "product_name": "Coca-cola", "product_price": 8000 ,"product_picture": cocacola.jpg, "product_status": 1 | 0}`

- `/category/` (Post category)

  - `{ "category_name": "Food", "category_status": 1 | 0}`

- `/purchase/` (Post purchase)

  - `{ "orders": [{"product_id": 1, "purchase_qty": 1},{"product_id": 2, "purchase_qty": 3}] }`

- `/users/register` (Register user)
  - `{ "user_email": "cashier@gmail.com", "user_password": "Marakesh12", "user_name": "cashier1"}`
- `/users/login` (Login user)
  - `{ "user_email": "cashier@gmail.com", "user_password": "Marakesh12"}`

**3. PATCH**

- `/product/:id` (Update product by id)

  - `{ "category_id": 2, "product_name": "Coca-cola", "product_price": 8000 ,"product_picture": cocacola.jpg, "product_status" : 1 | 0}`

- `/category/:id` (Update category by id)

  - `{ "category_name": "Food", "category_status" : 1 | 0}`

- `/users/patch/:id` (Update user by id)
  - `{ "user_name": "cashier1", "user_password": "Marakesh12", "user_role": 2, "user_status": 1 | 0}`

**4. DELETE**

- `/product/:id` (Delete product by id)
- `/category/:id` (Delete category by id)

## Postman link

Link: https://web.postman.co/collections/12323107-3cd415e1-06ec-4889-9c61-e1c90c4ba219?version=latest&workspace=b7f7c54f-78e5-4889-81bc-f5c323799f66

