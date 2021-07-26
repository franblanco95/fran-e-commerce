import { createContext, useState, useEffect } from 'react';
import { getFirestore } from '../firebase/client';

export const CartContext = createContext();

export const CartComponentContext = ({ children }) => {



    const [carrito, setCarrito] = useState([])
    const [totalPrice, setTotalPrice] = useState(0)
    const [productos, setProductos] = useState([])

    //Traigo a los productos de la BD de Firestore
    const getData = () => {
        const db = getFirestore();

        const itemsCollection = db.collection('productos');
        itemsCollection.get().then((value) => {
            if (value.size === 0) {
                console.log('No results')
            }
            const aux = value.docs.map(doc => {
                return { ...doc.data(), id: doc.id }
            });
            console.log(aux)
            setProductos(aux)
        })

    }

    useEffect(() => {
        getData();

    }, [])

    function createOrder(e, name, email, phone) {
        e.preventDefault()
        const db = getFirestore();
        console.log(name, email, phone)
        //Creamos una coleccion orders en firebase
        const order = { buyer: { name, phone, email }, item: carrito, total: totalPrice };
        db.collection("orders").add(order).then(({ id }) => {
            console.log(id);
        });
    }


    //Controla si el elemento ya esta en el carrito
    const isInCart = (id) => carrito.some(product => product.id === id)

    const addItem = ({ product }, quantity) => {
        if (isInCart(product.id)) {
            const newCart = carrito.map(cartElement => {
                if (cartElement.id === product.id) {
                    return { ...cartElement, quantity: cartElement.quantity + quantity }
                } else return cartElement;
            })
            setCarrito(newCart);
        } else {
            setCarrito(prev => [...prev, { ...product, quantity }]);
        }

    }

    const vaciarCarrito = () => {
        setCarrito([]);
        console.log(carrito)
    }

    const removeItem = (index) => {
        let updatedCart = carrito;
        updatedCart.splice(index, 1);
        setCarrito(updatedCart);
        console.log(carrito)

    }

    const getTotalPrice = () => {
        let total = carrito.reduce((acc, cur) => {
            return (cur.price * cur.quantity) + acc
        }, 0);
        // el 0 es el primer valor que le damos a la variable acc
        setTotalPrice(total);
    }

    useEffect(() => {
        const localCart = localStorage.getItem('carrito');
        if (!localCart) localStorage.setItem('carrito', JSON.stringify([]));
        else setCarrito(JSON.parse(localCart));
    }, []);

    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        getTotalPrice();
    }, [carrito])

    return (
        <CartContext.Provider value={{ addItem, carrito, setCarrito, vaciarCarrito, removeItem, totalPrice, productos, setProductos, createOrder }}>
            {children}
        </CartContext.Provider>
    )
}