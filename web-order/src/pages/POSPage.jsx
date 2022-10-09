import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ComponentToPrint } from '../components/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';

function POSPage () {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const toastOptions = {
        autoClose: 400,
        pauseOnHover: true,
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        const result = await axios.get('products');
        setProducts(await result.data);
        setIsLoading(false);
    };

    const addProductToCart = async (product) => {
        // check if the adding product exist
        let findProductInCart = await cart.find((i) => {
            return i.id === product.id;
        });

        if (findProductInCart) {
            let newCart = [];
            let newItem;

            cart.forEach((cartItem) => {
                if (cartItem.id === product.id) {
                    newItem = {
                        ...cartItem,
                        quantity: cartItem.quantity + 1,
                        totalAmount: cartItem.price * (cartItem.quantity + 1),
                    };
                    newCart.push(newItem);
                } else {
                    newCart.push(cartItem);
                }
            });

            setCart(newCart);
            toast(`Added ${newItem.name} to cart`, toastOptions);
        } else {
            let addingProduct = {
                ...product,
                quantity: 1,
                totalAmount: product.price,
            };
            setCart([...cart, addingProduct]);
            toast(`Added ${product.name} to cart`, toastOptions);
        }
    };

    const removeProduct = async (product) => {
        const newCart = cart.filter((cartItem) => cartItem.id !== product.id);
        setCart(newCart);
    };

    const componentRef = useRef();

    const handleReactToPrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handlePrint = () => {
        handleReactToPrint();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let newTotalAmount = 0;
        cart.forEach((icart) => {
            newTotalAmount = newTotalAmount + parseInt(icart.totalAmount);
        });
        setTotalAmount(newTotalAmount);
    }, [cart]);

    return (
        <MainLayout>
            <div className="row row-cols-auto row-cols-md-auto g-4">
                <div className="card-container">
                    { isLoading ? ('Loading') : (
                        <div className="row row-cols-auto row-cols-md-auto g-4">
                            { products.map((product, key) => (
                                <div key={ key } className="col">
                                    <div
                                        className="pos-item px-auto text-center card"
                                        onClick={ () => addProductToCart(product) }
                                    >
                                        <p>{ product.name }</p>
                                        <img
                                            src={ product.image }
                                            className="pos-item:hover"
                                            alt={ product.name }
                                        />
                                        <p>{ product.price } ៛</p>
                                    </div>
                                </div>
                            )) }
                        </div>
                    ) }
                </div>
                <div className="container col-lg-auto mt-3">
                    <div style={ { display: 'none' } }>
                        <ComponentToPrint
                            cart={ cart }
                            totalAmount={ totalAmount }
                            ref={ componentRef }
                        />
                    </div>
                    <div className="table-responsive bg-dark">
                        <table className="table table-responsive table-dark table-hover">
                            <thead>
                                <tr>
                                    <td>#</td>
                                    <td>Name</td>
                                    <td>Price</td>
                                    <td>Qty</td>
                                    <td>Total</td>
                                    <td>Action</td>
                                </tr>
                            </thead>
                            <tbody>
                                { cart
                                    ? cart.map((cartProduct, key) => (
                                        <tr key={ key }>
                                            <td>{ cartProduct.id }</td>
                                            <td>{ cartProduct.name }</td>
                                            <td>{ cartProduct.price }</td>
                                            <td>{ cartProduct.quantity }</td>
                                            <td>{ cartProduct.totalAmount }</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={ () => removeProduct(cartProduct) }
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                    : 'No Item in Cart' }
                            </tbody>
                        </table>
                        <h2 className="px-2 text-white">Total Amount: { totalAmount }៛</h2>
                    </div>
                    <div className="mt-3">
                        { totalAmount !== 0 ? (
                            <div>
                                <button
                                    className="btn btn-primary btn-lg container center bg-dark"
                                    onClick={ handlePrint }
                                >
                                    កម្មង់
                                </button>
                            </div>
                        ) : (
                            'Please add a product to the cart'
                        ) }
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default POSPage;
