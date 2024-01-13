var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createElement } from "../common/utils.js";
import { Panel, BUTTON_TYPE } from "./panel.js";
import { Map } from "./map.js";
import * as versusHub from "../common/versus-hub.js";
class Game {
    constructor() {
        var lobbyId = localStorage.getItem("lobbyId");
        this._isVersus = lobbyId !== null && lobbyId !== "0" && lobbyId !== undefined;
        this._element = createElement("div", { "data-control": "Game" });
        this._panel = new Panel();
        this._element.appendChild(this._panel.element);
        this._map = new Map();
        this._map._map.addEventListener("click", function (event) {
            const lat = event.latlng.lat;
            const lng = event.latlng.lng;
        
            console.log("Latitude: ", lat);
            console.log("Longitude: ", lng);
        });
        this._element.appendChild(this._map.element);
        this._index = 0;
        this._total = 0;
        this._panel.setButton(BUTTON_TYPE.SUBMIT);
        this._panel.disable();
        if (this._isVersus) {
            (() => __awaiter(this, void 0, void 0, function* () {
                const roundOver = () => {
                    this._panel.enable(true);
                    if (this._index === this._locations.length - 1) {
                        this._panel.setButton(BUTTON_TYPE.CONTINUE);
                    }
                    else if (String(this._versusData.lobby.ownerVersusLobbyUserId) == localStorage.getItem("lobbyUserId")) {
                        this._panel.setButton(BUTTON_TYPE.NEXT);
                    }
                    else {
                        this._panel.disable();
                        this._panel.setButton(BUTTON_TYPE.WAITINGHOST);
                    }
                };
                versusHub.onUserUnsubscribed(() => __awaiter(this, void 0, void 0, function* () {
                    const isRoundOver = yield versusHub.isRoundOver(parseInt(localStorage.getItem("game")), this._locations[this._index].locationId);
                    if (isRoundOver)
                        roundOver();
                }));
                versusHub.onRoundOver(() => {
                    roundOver();
                });
                versusHub.onNextRound(() => {
                    this._panel.enable(true);
                    this._next(this._locations[++this._index].image);
                    this._panel.disable();
                    this._panel.setButton(BUTTON_TYPE.SUBMIT);
                    this._map.enable();
                });
                versusHub.onRequestUsersState(() => __awaiter(this, void 0, void 0, function* () {
                    yield versusHub.setUserState("is_on_lobby_details_page", "false");
                }));
                yield versusHub.subscribe(lobbyId, localStorage.getItem("lobbyUserId"));
                yield versusHub.setUserState("is_on_lobby_details_page", "false");
                this._versusData = yield (yield fetch("/API/FetchLobbyInitialDetails", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        lobbyId: localStorage.getItem("lobbyId")
                    })
                })).json();
                this._map.setVersus(this._versusData);
            }))();
        }
        this._map.element.addEventListener("mark", () => {
            this._panel.enable();
        });
        this._panel.element.addEventListener("next", () => __awaiter(this, void 0, void 0, function* () {
            this._next(this._locations[++this._index].image);
            this._panel.disable();
            this._panel.setButton(BUTTON_TYPE.SUBMIT);
            this._map.enable();
            if (this._isVersus) {
                yield versusHub.nextRound();
            }
        }));
        this._panel.element.addEventListener("submit", () => __awaiter(this, void 0, void 0, function* () {
            this._map.disable();
            this._panel.disable(true);
            yield this._submitGuess();
            if (this._isVersus) {
                if (this._panel.buttonType == BUTTON_TYPE.SUBMIT) {
                    this._panel.enable(true);
                    this._panel.disable();
                    this._panel.setButton(BUTTON_TYPE.WAITINGPLAYERS);
                }
            }
            else {
                this._panel.enable(true);
                this._panel.setButton(this._index === this._locations.length - 1 ? BUTTON_TYPE.CONTINUE : BUTTON_TYPE.NEXT);
            }
        }));
        this._panel.element.addEventListener("continue", () => {
            this._panel.disable();
            let dialog = createElement("div", { class: "dialog" }, this._element);
            createElement("div", { class: "modal" }, dialog);
            let content = createElement("div", { class: "content" }, dialog);
            createElement("div", { class: "message", "data-message": `${sessionStorage.getItem("username") || "Player"}, you scored:`, "data-total": `${this._total}/2500` }, content);
            var lobbyId = localStorage.getItem("lobbyId");
            if (lobbyId == null || lobbyId == "0" || lobbyId == undefined) {
                let button = createElement("button", { class: "new" }, content, "New Game");
                button.addEventListener("click", () => {
                    window.location.reload();
                });
            }
            else {
                let button = createElement("button", { class: "new" }, content, "Go back to Lobby");
                button.addEventListener("click", () => {
                    window.location.href = "/Lobby";
                });
            }
            //if (_getCookie("name").toUpperCase() == "DARKVIPERAU") {
            //    let joke = createElement("div", { class: "joke" }, content, "Penalties for Matt ");
            //    createElement("span", { class: "emphasis" }, joke, "100");
            //    joke.appendChild(new Text(" points deducted for not letting chat click on your head. Final score "));
            //    createElement("span", { class: "emphasis" }, joke, String(this._total - 100));
            //    joke.appendChild(new Text(". If you let chat click on your head, you can add the 100 points back at the end."));
            //}
            // Paypal donate button
            let donate = createElement("div", { class: "donate", "data-message": "If you like the project and wish to help out and see it grow, feel free to:" }, content);
            createElement("a", {
                class: "patreon fab fa-patreon", "target": "_blank", "href": "https://www.patreon.com/gtaguessr"
            }, donate, "Become a patreon");
            let form = createElement("form", { action: "https://www.paypal.com/donate", method: "post", target: "_top" }, donate);
            createElement("input", { type: "hidden", name: "hosted_button_id", value: "T6A23SBWU6MFG" }, form);
            createElement("input", { type: "image", src: "https://www.paypalobjects.com/en_GB/i/btn/btn_donate_LG.gif", border: "0", name: "submit", title: "PayPal - The safer, easier way to pay online!", alt: "Donate with PayPal button" }, form);
            createElement("img", { alt: "Paypal donate pixel", border: "0", src: "https://www.paypal.com/en_GB/i/scr/pixel.gif", width: "1", height: "1" }, form);
            let merchandise = createElement("div", { class: "merchandise", "data-title": "We have shirts!" }, content);
            createElement("img", { alt: "A shirt with the logo of the website", class: "shirt", src: "/images/800.jpg" }, merchandise).addEventListener("click", () => {
                window.open('https://smilish.creator-spring.com/listing/gtaguessr?product=389&amp;variation=100029&amp;size=3000', '_blank');
            });
            createElement("img", { alt: "Tank top with the logo of the website", class: "shirt", src: "/images/500.jpg" }, merchandise).addEventListener("click", () => {
                window.open('https://smilish.creator-spring.com/listing/gtaguessr?product=755&variation=103338&size=4360', '_blank');
            });
        });
        this._panel.element.addEventListener("resize", () => {
            this._map.invalidate();
        });
        this._map.disable();
        let request = "GetLocations";
        let body = JSON.stringify(localStorage.getItem("playedLocations") || "");
        // Regular game, not a versus match
        if (localStorage.getItem("lobbyId") != "0") {
            request = "GetVersusLocations";
            body = JSON.stringify({
                lobbyId: localStorage.getItem("lobbyId"),
                lobyUserId: localStorage.getItem("lobbyUserId")
            });
        }
        else if (localStorage.getItem("easyMode") === "1") {
            request = "GetEasyLocations";
        }
        fetch(`/API/${request}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        }).then((response) => __awaiter(this, void 0, void 0, function* () {
            this._locations = (yield response.json()).locations;
            this._panel.setLocationIds(this._locations.map(x => x.locationId));
            this._panel.setImage(this._locations[this._index].image);
            this._panel.setRound(this._index + 1);
            this._map.setImageUrl(this._locations[this._index].image);
            this._map.enable();
        }));
    }
    _next(image) {
        this._map.reset();
        this._panel.resetScore();
        this._panel.setImage(image);
        this._map.setImageUrl(image);
        this._panel.setRound(this._index + 1);
        if (this._isVersus)
            this._panel.renderScoresTable(false);
    }
    _submitGuess() {
        return __awaiter(this, void 0, void 0, function* () {
            const lobbyId = localStorage.getItem("lobbyId");
            const lobbyUserId = localStorage.getItem("lobbyUserId");
            const game = localStorage.getItem("game");
    
            const locationId = String(this._locations[this._index].locationId);
    
            // Make the POST request to obtain latitude and longitude
            const response = yield fetch("https://gtaguessr.com/API/SubmitAGuess?aaa", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    locationId: locationId,
                    lat: "1", // unimportant, replace with actual data
                    lng: "1"
                })
            });
    
            const responseData = yield response.json();
    
            const data = {
                sessionId: String(window.sessionId),
                locationId: locationId,
                lat: String(responseData.lat), // Use the latitude from the response
                lng: String(responseData.lng), // Use the longitude from the response
                lobyId: lobbyId,
                lobyUserId: lobbyUserId,
                game: game || "0"
            };
    
            const submitResponse = yield (yield fetch("/API/SubmitAGuess?bbb", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })).json();
    
            if (submitResponse.locationId != undefined) {
                let played = (localStorage.getItem("playedLocations") || "").split(",");
                if (played.indexOf(submitResponse.locationId) === -1) {
                    localStorage.setItem("playedLocations", played.concat(submitResponse.locationId).join(","));
                }
            }
    
            this._map.showRealLatLng({ lat: submitResponse.lat, lng: submitResponse.lng });
            this._total += Number(submitResponse.points);
    
            if (!this._isVersus) {
                this._panel.setLocation(this._index + 1);
                this._panel.setScore(Number(submitResponse.points), Number(submitResponse.distance));
                this._panel.setTotal(this._total);
            }
        });
    }
    get element() {
        return this._element;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    history.pushState({}, document.title, "/Guess");
    document.body.querySelector("main").appendChild(new Game().element);
    InitiateDarkViperAURules();
    InitiateOtherRules();
});
function InitiateOtherRules() {
    if (notifications != null && notifications != '') {
        document.querySelector("#notification").setAttribute("style", "display:block !important;");
        document.querySelector("#notification").innerHTML = notifications;
    }
}
function InitiateDarkViperAURules() {
    var name = _getCookie('name');
    if (name.toUpperCase() == "DARKVIPERAU") {
        document.querySelector("footer").style.display = 'none';
    }
}
function _getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}
