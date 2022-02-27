import React from "react";
import playStore from "../../../images/playstore.png";
import appStore from "../../../images/Appstore.png";
import "./Footer.css"
const Footer =() =>{
    return (
        <footer id="footer">
            <div class="leftFooter">
                <h4>DownLoad Our App</h4>
                <p>DownLoad App for Android and IOS mobile phone</p>
                <img src={playStore} alt="playstore"/>
                <img src={appStore} alt="appstore"/>
            </div>

            <div class="midFooter">
                <h1>ECommerse</h1>
                <p>Customer Service is our first priority</p>
                <p>Copyright 2022 &copy; SnehalPatil</p>
            </div>

            <div class="rightFooter">
                <h4>Follow Us</h4>
                <a href="http://instagram.com">Instagram</a>
                <a href="http://youtube.com">Youtube</a>
                <a href="http://facebook.com">Facebook</a>
            </div>

        </footer>
        );
};

export default Footer;