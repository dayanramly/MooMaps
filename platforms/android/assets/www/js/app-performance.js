angular.module('moomaps', ['ionic'])

.run(function($ionicPlatform,$ionicPopup,$rootScope,$state,$stateParams) {
  $ionicPlatform.ready(function() {
    if(window.navigator && window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    $ionicPlatform.registerBackButtonAction(function (e) {
      if ($rootScope.$viewHistory.backView) {
        $rootScope.$viewHistory.backView.go();
      } else {
        if (confirm("Apakah kamu yakin ingin keluar?") == true) {
          ionic.Platform.exitApp();
        } else {
          return;
        }
      }
      e.preventDefault();
      return false;
    }, 101);
  });
})

//Router 
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('eventmenu', {
    url: "/event",
    templateUrl: "event-menu.html"
  })
  .state('eventmenu.home', {
    url: "/home",
    views: {
      'menuContent' :{
        templateUrl: "home.html"
      }
    }
  })
  .state('eventmenu.peta', {
    url: "/peta",
    views: {
      'menuContent' :{
        templateUrl: "tampilPeta.html",
        controller:"tampilCtrl"
      }
    }
  })
  .state('eventmenu.lihatkampus', {
    url: "/lihatkampus",
    views: {
      'menuContent' :{
        templateUrl: "lihatkampus.html",
        controller: "lihatCtrl"
      }
    }
  })
  .state('eventmenu.universitas',{
    url:'/lihatkampus/universitas/:id',
    views:{
      'menuContent' :{
        templateUrl:'universitas.html',
        controller:"univCtrl"
      }
    }
  })
  .state('eventmenu.listprodi',{
    url:'/lihatkampus/universitas/prodi/:id',
    views:{
      'menuContent' :{
        templateUrl:'listprodi.html',
        controller:"listCtrl"
      }
    }
  })
  .state('eventmenu.mapkampus',{
    url:'/lihatkampus/universitas/peta/:id',
    views:{
      'menuContent':{
        templateUrl:'mapkampus.html',
        controller:"mapkampusCtrl"
      }
    }
  })
  .state('eventmenu.programstudi', {
    url: "/programstudi",
    views: {
      'menuContent' :{
        templateUrl: "programstudi.html",
        controller: "prodiCtrl"
      }
    }
  })
  .state('eventmenu.detailprodi',{
    url:'/programstudi/detail/:id',
    views:{
      'menuContent' :{
        templateUrl:'detailprodi.html',
        controller:"detailCtrl"
      }
    }
  })
  .state('eventmenu.jalurkampus', {
    url: "/jalurkampus",
    views: {
      'menuContent' :{
        templateUrl: "jalurkampus.html",
        controller: "lihatCtrl"
      }
    }
  })
  .state('eventmenu.jalurkampusdetail',{
    url:"/jalurkampus/universitas/:id",
    views: {
      'menuContent' :{
        templateUrl: "jalurkampusdetail.html",
        controller: "jalurCtrl"
      }
    }
  })
  .state('eventmenu.jalankampus',{
    url:"/jalurkampus/universitas/jalur/:id",
    views: {
      'menuContent' :{
        templateUrl: "jalankampus.html",
        controller: "jalurkampusCtrl"
      }
    }
  })
  .state('eventmenu.petunjuk',{
    url:"/petunjuk",
    views: {
      'menuContent' :{
        templateUrl: "petunjuk.html"
      }
    }
  })
  $urlRouterProvider.otherwise("/event/home");
})
//Controller utama
.controller('slideCtrl', function ($scope, $ionicSideMenuDelegate, $ionicLoading, $compile, $location, $ionicPlatform, $ionicPopup, $http) {
  $scope.data = {};
  $scope.clearSearch = function() {
    $scope.data.searchQuery = '';
  };
  $scope.clearFilter = function() {
    $scope.searchQuery = {};
  }
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.goHome = function () {
    if ((window.location) && (window.location.hash) && (window.location.hash.indexOf('home') > 0)) {
      navigator.app.exitApp();
    }
    else {
      $location.path('/home');
      if (!$scope.$$phase)
        $scope.$apply();
    }
  }
})
//end controller utama  
//1. controller Home (tampil peta)
.controller('tampilCtrl', function ($scope, $ionicSideMenuDelegate, $ionicLoading, $compile, $location, $ionicPlatform, $ionicPopup, $http){
  $scope.loading = $ionicLoading.show({
    content: 'Getting current location...',
    showBackdrop: false
  });
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition,showError,{enableHighAccuracy:true, maximumAge:600000, timeout:600000});
  } else { 
    alert("Geolocation is not supported by this browser.");
  }
  function showPosition(position) {
    var sendDate = (new Date()).getTime();
    $http.get("http://servermaps.dayanramly.web.id/alamat") 
    .success(function(data, status, headers, config){
      $ionicLoading.hide();
      var receiveDate = (new Date()).getTime();
      var responseTimeMs = receiveDate - sendDate;
      alert("Map Posisiku response : "+responseTimeMs+" ms");
      $scope.posts=data;
      initmap(position.coords.latitude, position.coords.longitude, $scope.posts);
    })
    .error(function(data, status, headers, config){
      $ionicLoading.hide();
      alert("Koneksi Gagal");
      history.back();
    })
  }
  function showError(error) {
    $ionicLoading.hide();
    switch(error.code) {
      case error.PERMISSION_DENIED:
      alert("Aktifkan GPS terlebih dahulu")
      break;
      case error.POSITION_UNAVAILABLE:
      alert("Lokasi tidak ditemukan")
      break;
      case error.TIMEOUT:
      alert("Waktu koneksi habis")
      break;
      case error.UNKNOWN_ERROR:
      alert("Error tidak ditemukan")
      break;
    }
  }
})
//end controller Home (tampil peta)   
//2. controller list universitas
.controller('lihatCtrl', function ($scope, $http, $ionicLoading) {
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/universitas") 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("List Universitas response : "+responseTimeMs+" ms");
    if(data==''){
      alert("Belum ada data");
      history.back();
    }else{
      $scope.posts=data;
    }
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller list universitas
//2.1 controller detail universitas
.controller('univCtrl', function ($scope, $stateParams, $http, $ionicLoading) {
  $scope.id_univ=$stateParams.id;
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/universitas/"+$scope.id_univ) 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("Detail universitas response : "+responseTimeMs+" ms");
    if(data==''){
      alert("Belum ada data");
      history.back();
    }else{
      $scope.univku=data;
    }
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller detail universitas
//2.1.1 controller list prodi dalam universitas
.controller('listCtrl', function ($scope, $stateParams, $http, $ionicLoading) {
  $scope.id_list=$stateParams.id;
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/universitas/prodi/"+$scope.id_list) 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("List Prodi Universitas response : "+responseTimeMs+" ms");
    if(data==''){
      alert("Belum ada data");
      history.back();
    }else{
      $scope.lists=data;
    }
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller list prodi dalam universitas
//2.1.2 controller map kampus universitas
.controller('mapkampusCtrl', function ($scope, $stateParams, $http, $ionicLoading) {
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  $scope.id_kampus=$stateParams.id;
  //get data
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/universitas/peta/"+$scope.id_kampus)
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("Map Kampus response : "+responseTimeMs+" ms");
    if(data==''){
      alert("Belum ada data");
      history.back();
    }else{
      $scope.mapku=data;
      multimap($scope.mapku);
    }
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller map kampus universitas
//3. controller list prodi
.controller('prodiCtrl', function ($scope, $http, $ionicLoading) {
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/prodi") 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("List Prodi response : "+responseTimeMs+" ms");
    $scope.posts=data;
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller list prodi
//3.1 controller detail prodi
.controller('detailCtrl', function ($scope, $stateParams, $http, $ionicLoading) {
  // console.log($stateParams.id);
  $scope.id_prodi=$stateParams.id;
  $scope.nama_prodi=$stateParams.nama;
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/prodi/"+$scope.id_prodi) 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("Detail Prodi response : "+responseTimeMs+" ms");
    if(data==''){
      alert("Belum ada data");
      history.back();
    }else{
      $scope.prodiku=data;
    }
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller detail prodi
//4. controller jalur ke Universitas
.controller('jalurCtrl', function ($scope, $http, $ionicLoading, $stateParams) {
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  $scope.id_kampus = $stateParams.id;
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/universitas/peta/"+$scope.id_kampus) 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("List Jalur Universitas response : "+responseTimeMs+" ms");
    if(data==''){
      alert("Belum ada data");
      history.back();
    }else{
      $scope.posts=data;
    }
  })
  .error(function(data, status, headers, config){
    $ionicLoading.hide();
    alert("Koneksi Gagal");
    history.back();
  })
})
//end controller jalur ke universitas
//4.1 controller detail jalur ke universitas
.controller('jalurkampusCtrl', function ($scope, $compile, $location, $http, $stateParams, $ionicLoading) {
  $scope.loading = $ionicLoading.show({
    content: 'Getting data...',
    showBackdrop: false
  });
  var directionsDisplay, directionsService;
  var startRouteLat, startRouteLong, endRouteLat, endRoutelong;

  $scope.id_alamat=$stateParams.id;
  var sendDate = (new Date()).getTime();
  $http.get("http://servermaps.dayanramly.web.id/jalurkampus/universitas/jalur/"+$scope.id_alamat) 
  .success(function(data, status, headers, config){
    $ionicLoading.hide();
    var receiveDate = (new Date()).getTime();
    var responseTimeMs = receiveDate - sendDate;
    alert("Jalur Kampus response : "+responseTimeMs+" ms");
    startRouteLat = data.latitude;
    startRouteLong = data.longitude;
    navigator.geolocation.getCurrentPosition(function(position) {
      endRouteLat = position.coords.latitude;
      endRoutelong = position.coords.longitude;
      initRoute(startRouteLat, startRouteLong, endRouteLat, endRoutelong);
    }, function(error) {
      $ionicLoading.hide();
      switch(error.code) {
        case error.PERMISSION_DENIED:
        alert("Aktifkan GPS terlebih dahulu")
        break;
        case error.POSITION_UNAVAILABLE:
        alert("Lokasi tidak ditemukan")
        break;
        case error.TIMEOUT:
        alert("Waktu koneksi habis")
        break;
        case error.UNKNOWN_ERROR:
        alert("Error tidak ditemukan")
        break;
      }
      history.back();
    }, {enableHighAccuracy:true,timeout:600000,maximumAge:600000});
  })
.error(function(data, status, headers, config){
  $ionicLoading.hide();
  alert("Koneksi Gagal");
  history.back();
})
})
//end controller detail jalur ke universitas
function initmap(myLat, myLong, mydata){
  var map, cityCircle;
  var infowindow = new google.maps.InfoWindow();
  var newLatlng = new google.maps.LatLng(myLat,myLong);
  var mapOptions = {
    zoom: 15,
    center: newLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map'),
    mapOptions);
  var populationOptions = {
    strokeWeight: 0, 
    fillColor: "#008595", 
    fillOpacity: 0.25, 
    center: newLatlng, 
    radius: 800,
    map:map
  }
  var marker = new google.maps.Marker({
    position: newLatlng,
    title:"My Position",
    map:map
  });
  marker.setMap(map);
  cityCircle = new google.maps.Circle(populationOptions);
  multimarker(mydata, map);
}
function multimarker(mydata,map){
  var marker, i;
  for(i=0;i<mydata.length;i++){
    var newLatlng = new google.maps.LatLng(mydata[i].latitude,mydata[i].longitude);
    marker = new google.maps.Marker({
      position: newLatlng,
      icon:new google.maps.MarkerImage(
        '../www/img/map.svg',
        null,
        null,
        null,
        new google.maps.Size(42,68)),
      title:"ini"
    });
    marker.setMap(map);
  }
}
function multimap(mydata){
  var map;
  var newLatlng = new google.maps.LatLng(mydata[0].latitude,mydata[0].longitude);
  var mapOptions = {
    zoom: 14,
    center: newLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('mapkampus'),
    mapOptions);

  var marker, i;
  for(i=0;i<mydata.length;i++){
    var newLatlng = new google.maps.LatLng(mydata[i].latitude,mydata[i].longitude);
    marker = new google.maps.Marker({
      position: newLatlng,
      icon: new google.maps.MarkerImage(
        '../www/img/map.svg',
        null,
        null,
        null,
        new google.maps.Size(42,68)),
      title:"ini"
    });
    marker.setMap(map);
  }
}
function initRoute(startRouteLat, startRouteLong, endRouteLat, endRoutelong){
  // console.log(startRouteLat+','+startRouteLong+','+endRouteLat+','+endRoutelong);
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsService = new google.maps.DirectionsService();
  var map;
  var newLatlng = new google.maps.LatLng(startRouteLat,startRouteLong);
  // console.log(newLatlng);
  var mapOptions = {
    zoom: 15,
    center: newLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('mapjalur'),
    mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));
  calcRoute(startRouteLat, startRouteLong, endRouteLat, endRoutelong);
};
function calcRoute(startRouteLat, startRouteLong, endRouteLat, endRoutelong) {
  var end = startRouteLat+','+startRouteLong;
  var start = endRouteLat+','+endRoutelong;
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
};
function clickTest() {
  alert('Example of infowindow with ng-click')
};