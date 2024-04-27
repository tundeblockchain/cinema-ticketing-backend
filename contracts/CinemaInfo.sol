// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "../interfaces/ICinemaMarket.sol";

contract CinemaInfo{
    ICinemaMarket private cinemaMarket;
    mapping(string => CinemaItem) private _cinemaItems;
    mapping(string => ScreenItem) private _screenItems;
    mapping(string => PlaceItem) private _placeItems;
    mapping(string => FilmItem) private _filmItems;
    mapping(string => ActorItem) private _actorItems;
    string[] _cinemakeys;
    string[] _screenkeys;
    string[] _placekeys;
    string[] _filmkeys;
    string[] _actorkeys;

    address private owner;
    address private marketAddress;
    string private nftName;

    struct CinemaItem {
        string itemID;
        string name;
        string uri;
        address cinemaAddress;
    }

    struct ScreenItem {
        string itemID;
        string uri;
        string placeId;
    }

    struct PlaceItem {
        string itemID;
        string uri;
        string cinemaId;
    }

    struct FilmItem {
        string itemID;
        string uri;
        string title;
    }

    struct ActorItem {
        string itemID;
        string uri;
    }

    event CinemaCreated (
        uint256 indexed id,
        string itemID,
        string name,
        string uri
    );

    event ScreenCreated (
        uint256 indexed id,
        string itemID,
        string placeID,
        string uri
    );

    event PlaceCreated (
        uint256 indexed id,
        string itemID,
        string cinemaID,
        string uri
    );

    event FilmCreated (
        uint256 indexed id,
        string itemID,
        string title,
        string uri
    );

    event ActorCreated (
        uint256 indexed id,
        string itemID,
        string uri
    );

    modifier onlyOwner(){
        require(msg.sender == owner, "untrusted message sender");
        _;
    }

    constructor(){
        owner = msg.sender;
    }

    function setMarket(address market) public onlyOwner{
        cinemaMarket = ICinemaMarket(market);
    }

    function addCinema(string memory cinemaId, string memory name, string memory uri) public{
        CinemaItem storage cinemaItem = _cinemaItems[cinemaId];
        cinemaItem.itemID = cinemaId;
        cinemaItem.name = name;
        cinemaItem.uri = uri;

        _cinemakeys.push(cinemaId);
        cinemaItem.cinemaAddress = cinemaMarket.createCinemaChain(name);
        emit CinemaCreated(_cinemakeys.length, cinemaId, name, uri);
    }

    function addPlace(string memory placeId, string memory cinemaId, string memory uri) public{      
        require(keccak256(abi.encodePacked(_cinemaItems[cinemaId].itemID)) == keccak256(abi.encodePacked(cinemaId)), "Place should be connected to existing cinema");
        PlaceItem storage placeItem = _placeItems[placeId];
        placeItem.itemID = placeId;
        placeItem.uri = uri;
        placeItem.cinemaId = cinemaId;
        
        _placekeys.push(placeId);
        emit PlaceCreated(_placekeys.length, placeId, cinemaId, uri);
    }

    function addScreen(string memory screenId, string memory placeId, string memory uri) public{      
        require(keccak256(abi.encodePacked(_placeItems[placeId].itemID)) == keccak256(abi.encodePacked(placeId)), "Screen should be connected to existing place");
        ScreenItem storage screenItem = _screenItems[screenId];
        screenItem.itemID = screenId;
        screenItem.uri = uri;
        screenItem.placeId = placeId;
        
        _screenkeys.push(screenId);
        emit ScreenCreated(_screenkeys.length, screenId, placeId, uri);
    }

    function addActor(string memory actorId, string memory uri) public{      
        ActorItem storage actorItem = _actorItems[actorId];
        actorItem.itemID = actorId;
        actorItem.uri = uri;
        
        _actorkeys.push(actorId);
        emit ActorCreated(_actorkeys.length, actorId, uri);
    }

    function addFilm(string memory filmId, string memory title, string memory uri) public{      
        FilmItem storage filmItem = _filmItems[filmId];
        filmItem.title = title;
        filmItem.itemID = filmId;
        filmItem.uri = uri;
        
        _filmkeys.push(filmId);
        emit FilmCreated(_filmkeys.length, filmId, title, uri);
    }

        function updateFilmUri(string memory filmId, string memory uri) public{ 
        require(keccak256(abi.encodePacked(_filmItems[filmId].itemID)) == keccak256(abi.encodePacked(filmId)), "Film does not exist");     
        FilmItem storage filmItem = _filmItems[filmId];
        filmItem.uri = uri;
    }

    function updateActorUri(string memory actorId, string memory uri) public{ 
        require(keccak256(abi.encodePacked(_actorItems[actorId].itemID)) == keccak256(abi.encodePacked(actorId)), "Actor does not exist");     
        ActorItem storage actorItem = _actorItems[actorId];
        actorItem.uri = uri;
    }

    function updateCinemaUri(string memory cinemaId, string memory uri) public{ 
        require(keccak256(abi.encodePacked(_cinemaItems[cinemaId].itemID)) == keccak256(abi.encodePacked(cinemaId)), "Cinema does not exist");     
        CinemaItem storage cinemaItem = _cinemaItems[cinemaId];
        cinemaItem.uri = uri;
    }

    function updatePlaceUri(string memory placeId, string memory uri) public{ 
        require(keccak256(abi.encodePacked(_placeItems[placeId].itemID)) == keccak256(abi.encodePacked(placeId)), "Place does not exist");     
        PlaceItem storage placeItem = _placeItems[placeId];
        placeItem.uri = uri;
    }

    function updateScreenUri(string memory screenId, string memory uri) public{ 
        require(keccak256(abi.encodePacked(_screenItems[screenId].itemID)) == keccak256(abi.encodePacked(screenId)), "Screen does not exist");     
        ScreenItem storage screenItem = _screenItems[screenId];
        screenItem.uri = uri;
    }

    function getAllFilms() public view returns(FilmItem[] memory){
        FilmItem[] memory allFilms = new FilmItem[](_filmkeys.length);
        for (uint i = 0; i < _filmkeys.length; i++) {
            allFilms[i] = _filmItems[_filmkeys[i]];
        }

        return allFilms;
    }

    function getAllActors() public view returns(ActorItem[] memory){
        ActorItem[] memory allActor = new ActorItem[](_actorkeys.length);
        for (uint i = 0; i < _actorkeys.length; i++) {
            allActor[i] = _actorItems[_actorkeys[i]];
        }

        return allActor;
    }

    function getAllCinemas() public view returns(CinemaItem[] memory){
        uint length = _cinemakeys.length;
        CinemaItem[] memory allCinema = new CinemaItem[](length);
        for (uint i = 0; i < length; i++) {
            allCinema[i] = _cinemaItems[_cinemakeys[i]];
        }

        return allCinema;
    }

    function getAllScreens() public view returns(ScreenItem[] memory){
        uint length = _screenkeys.length;
        ScreenItem[] memory allScreens = new ScreenItem[](length);
        for (uint i = 0; i < length; i++) {
            allScreens[i] = _screenItems[_screenkeys[i]];
        }

        return allScreens;
    }

    function getAllScreensByPlace(string memory placeId) public view returns(ScreenItem[] memory){
        uint length = _screenkeys.length;
        ScreenItem[] memory allScreens = new ScreenItem[](length);
        for (uint i = 0; i < length; i++) {
            if (keccak256(abi.encodePacked(_screenItems[_screenkeys[i]].placeId)) == keccak256(abi.encodePacked(placeId)))
                allScreens[i] = _screenItems[_screenkeys[i]];
        }

        return allScreens;
    }

    function getAllPlaces() public view returns(PlaceItem[] memory){
        uint length = _placekeys.length;
        PlaceItem[] memory allPlaces = new PlaceItem[](length);
        for (uint i = 0; i < length; i++) {
            allPlaces[i] = _placeItems[_placekeys[i]];
        }

        return allPlaces;
    }

    function getAllPlacesByCinema(string memory cinemaId) public view returns(PlaceItem[] memory){
        uint length = _placekeys.length;
        PlaceItem[] memory allPlaces = new PlaceItem[](length);
        for (uint i = 0; i < length; i++) {
            if(keccak256(abi.encodePacked(_placeItems[_placekeys[i]].cinemaId)) == keccak256(abi.encodePacked(cinemaId)))
                allPlaces[i] = _placeItems[_placekeys[i]];
        }

        return allPlaces;
    }

    function getCinema(string memory cinemaId) public view returns(CinemaItem memory){
        require(keccak256(abi.encodePacked(_cinemaItems[cinemaId].itemID)) == keccak256(abi.encodePacked(cinemaId)), "Cinema does not exist"); 
        return _cinemaItems[cinemaId];
    }

    function getPlace(string memory placeId) public view returns(PlaceItem memory){
        require(keccak256(abi.encodePacked(_placeItems[placeId].itemID)) == keccak256(abi.encodePacked(placeId)), "Place does not exist"); 
        return _placeItems[placeId];
    }

    function getScreen(string memory screenId) public view returns(ScreenItem memory){
        require(keccak256(abi.encodePacked(_screenItems[screenId].itemID)) == keccak256(abi.encodePacked(screenId)), "Screen does not exist"); 
        return _screenItems[screenId];
    }

    function getFilm(string memory filmId) public view returns(FilmItem memory){
        require(keccak256(abi.encodePacked(_filmItems[filmId].itemID)) == keccak256(abi.encodePacked(filmId)), "Film does not exist"); 
        return _filmItems[filmId];
    }

    function getActor(string memory actorId) public view returns(ActorItem memory){
        require(keccak256(abi.encodePacked(_actorItems[actorId].itemID)) == keccak256(abi.encodePacked(actorId)), "Actor does not exist"); 
        return _actorItems[actorId];
    }

    function totalNumberOfCinemas() public view returns(uint256){
        return _cinemakeys.length;
    }

    function totalNumberOfFilms() public view returns(uint256){
        return _filmkeys.length;
    }

    function totalNumberOfScreens() public view returns(uint256){
        return _screenkeys.length;
    }

    function totalNumberOfPlaces() public view returns(uint256){
        return _placekeys.length;
    }

    function totalNumberOfActors() public view returns(uint256){
        return _actorkeys.length;
    }
}