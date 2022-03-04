import React,{Fragment} from "react";
import { CgMouse } from "react-icons/all";
import "./Home/Home.css";
import Product from "./Product.js"

const product = {
    name: "Blue Tshirt",
    images : [{url: "https://i.ibb.co/DRST11n/1.webp"}],
    price: "$30",
    _id: "snehalp"

};
const Home = () =>{

    return (
        <Fragment>
            <div class="banner">
                <p>Welcome to Ecommerce</p>
                <h1> FIND AMAZING PRODUCTS BELOW</h1>

                <a href="#container">
                    <button>
                        Scroll<CgMouse />
                    </button>
                </a>
            </div>

            <h2 className="homeHeading">Featured Products</h2>

            <div className="container" id="container">
                <Product product={product} />
                <Product product={product} />
                <Product product={product} />
                <Product product={product} />
                
                <Product product={product} />
                <Product product={product} />
                <Product product={product} />
                <Product product={product} />
            </div>
        </Fragment>
    );
};


export default Home;