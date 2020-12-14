const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000

const app = express();



const mercadopago = require('mercadopago');
mercadopago.configure({
    access_token: 'APP_USR-8208253118659647-112521-dd670f3fd6aa9147df51117701a2082e-677408439',
    integrator_id: 'dev_2e4ad5dd362f11eb809d0242ac130004'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/detail', (req, res) => {
    res.render('detail', req.query);
});

app.post('/payment', async (req, res) => {
    console.log(req.body);
    const base_url = req.protocol+"://"+req.headers.host;
    const { img: picture_url, title, price: unit_price, unit: quantity } = req.body;
    const item = {
        items: [
            {
                id: '1234',
                title,  
                description: 'Dispositivo móvil de Tienda e-commerce',
                picture_url: `${ base_url }${ picture_url.substring(1) }`,
                quantity: 1,
                currency_id: 'PEN',
                unit_price: parseFloat(unit_price)
            }
        ],
        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_46542185@testuser.com',
            identification: {
                type: 'DNI',
                number: '22334445'
            },
            phone: {
                area_code: '52',
                number: 5549737300
            },
            address: {
                zip_code: '03940',
                street_name: 'Insurgentes Sur',
                street_number: 1602
            }
        },
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: 'diners'
                }
            ],
            excluded_payment_types: [
                {
                    id: 'atm'
                }
            ],
            installments: 6
        },
        back_urls: {
            success: `${ base_url }/success`,
            pending: `${ base_url }/pending`,
            failure: `${ base_url }/failure`
        },
        notification_url: 'https://hookb.in/2qxlgWQaJjc9BBKGpRBN',
        auto_return: 'approved',
        external_reference: 'jhonatantupayachihurtado@gmail.com',
    };
    const preference = await mercadopago.preferences.create(item)
    const init_point = preference.response.init_point;
    res.redirect(init_point);
});

app.get('/success', (req, res) => {
    const respuesta = {
        collection_id: req.query.collection_id,
        payment_id: req.query.payment_id,
        external_reference: req.query.external_reference,
        payment_type: req.query.payment_type
    }    
    res.render('success', respuesta);
})

app.get('/pending', (req, res) => {
    res.render('pending', req.query);
})

app.get('/failure', (req, res) => {
    res.render('failure', req.query);
})

app.listen(port);