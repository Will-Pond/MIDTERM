const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt=require('jsonwebtoken');  // add
const cookieParser = require('cookie-parser'); //add
require('dotenv').config();   //add
const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());  //add
app.use(cookieParser());   //add
app.use(express.json());  //add

let shops = [];
let shopsinfo = []; 
/*
let csvString=fs.readFileSync('./usercredentials.csv', 'utf8')
let jsArray=csvString.split(/[\r\n]+/)


for(let i=0;i<jsArray.length;i++){
	let user=jsArray[i].split(',')
	console.log(`email:${user[0]}\tpassword:${user[1]}`);
}
app.post('http://localhost:3001/Sign_in.html', (req, res) => {
	const { email, password } = req.body;
	const LoginInfo = { email, password };
	console.log(LoginInfo);
});

*/




app.use(express.static(path.join(__dirname, 'test')));


fs.readFile('shopinfo.json', (err, data) => {
    if (err) {
        console.error('Error reading shops file:', err);
    } else {
        shops = JSON.parse(data);
        console.log('Shops loaded from file');
    }
});
fs.readFile('shopmenu.json', (err, data) => {
    if (err) {
        console.error('Error reading shops file:', err);
    } else {
        shopsinfo = JSON.parse(data);
        console.log('Shops menu loaded from file');
    }
});

app.post('/donutshop', (req, res) => {
    const newShop = req.body;
    newShop.index = shops.length+1;
    console.log('New Shop Object:', newShop);
    shops.push(newShop);
    saveShopsToFile();
    console.log('Shops after adding new shop:', shops); 
    res.json(newShop); 
});


app.get('/donutshop/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const shop = shops.find(shop => shop.index === index);
    if (shop) {
        res.json(shop);
    } else {
        res.status(404).json({ error: 'Donut shop not found' });
    }
});


app.put('/dountshop', (req, res) => {
    const index = parseInt(req.params.index);
    const shopIndex = shops.findIndex(shop => shop.index === index);
    if (shopIndex !== -1) {
        shops[shopIndex] = req.body;
        shops[shopIndex].index = index; 
        saveShopsToFile();
        res.json({ message: 'Donut shop updated successfully' });
    } else {
        res.status(404).json({ error: 'Donut shop not found' });
    }
});


app.delete('/donutshop/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const shopIndex = shops.findIndex(shop => shop.index === index);
    if (shopIndex !== -1) {
        shops.splice(shopIndex, 1);
        

        fs.writeFile('shopinfo.json', JSON.stringify(shops), err => {
            if (err) {
                console.error('Error saving shops to file:', err);
                res.status(500).json({ error: 'Error deleting donut shop' });
            } else {
                console.log('Donut shop deleted successfully');
                res.json({ message: 'Donut shop deleted successfully' });
            }
        });
    } else {
        res.status(404).json({ error: 'Donut shop not found' });
    }
});


app.get('/donutmenu', (req, res) => {
    res.json(shopsinfo);
});
app.get('/donutshop', (req, res) => {
    res.json(shops);
});


function saveShopsToFile() {
    fs.writeFile('shopinfo.json', JSON.stringify(shops), err => {
        if (err) {
            console.error('Error saving shops to file:', err);
        } else {
            console.log('Shops saved to file');
        }
    });
}

// signout but might need to change api

app.get('http://localhost:3001/Sign_out.html',(req,res)=>{
	res.cookie('token', '', { httpOnly: true, secure: true });
});


const users=[
	{ id: 1, email: 'caporusson1@nku.edu', password: 'password1' },
	{ id: 2, email: 'johndoe@nku.edu', password: 'password2' }
];


app.post('http://localhost:3001/Sign_in.html',(req,res)=>{
	const { username, password } = req.body;
	const user = users.find(u => u.username === username && u.password === password);
	if (user) {
		const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
		res.cookie('token', 'Bearer ' + token, { httpOnly: true, secure: true });
		res.json({ status:1,jwt:token });
	} else {
		res.status(401).send({ status:-1,jwt:'Invalid credentials'});
	}
});



// verifyToken
function verifyToken(req, res, next) {
	let bearerHeader = req.headers['authorization'];
	if(!bearerHeader){
		bearerHeader= req.cookies.token;
	}
	if (typeof bearerHeader !== 'undefined') {
		const bearerToken = bearerHeader.split(' ')[1];
		jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				req.user = authData;
				next();
			}
		});
	} else {
		res.sendStatus(403);
	}
}





app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
