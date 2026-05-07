// live-activity.js — Sprint 4B: Social proof toast
(function () {
  'use strict';

  var NAMES = [
    'Rahul', 'Amit', 'Priya', 'Sunita', 'Deepak', 'Raj', 'Neha',
    'Vikash', 'Ankit', 'Pooja', 'Suresh', 'Kavita', 'Mohit', 'Ritu',
    'Sanjay', 'Preeti', 'Arun', 'Sneha', 'Rohit', 'Simran',
  ];

  var CITIES = [
    'Delhi', 'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Surat', 'Indore',
    'Bhopal', 'Nagpur', 'Chandigarh', 'Noida', 'Gurgaon', 'Patna',
  ];

  var PRODUCTS = [
    'iPhone 13 Display', 'Samsung A52 Battery', 'Redmi Note 10 Screen',
    'OnePlus 9 Back Glass', 'iPhone 11 Pro Backglass', 'Samsung S22 Camera',
    'Oppo F21 Display', 'Vivo V23 Battery', 'Mi 11 Lite Screen',
    'iPhone XR LCD', 'Samsung A32 Display', 'Realme 9 Pro Battery',
    'iPhone 12 Back Cover', 'Samsung M32 Screen', 'Charging Flex Cable Kit',
    'Type-C Charging Port', 'iPhone 14 Speaker', 'Samsung Galaxy S23 Display',
    'Redmi Note 12 Battery', 'iPhone 15 Back Glass',
  ];

  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showToast() {
    var toast = document.getElementById('live-activity-toast');
    if (!toast) return;

    var name = rand(NAMES);
    var city = rand(CITIES);
    var product = rand(PRODUCTS);

    toast.querySelector('.lat-name').textContent = name;
    toast.querySelector('.lat-city').textContent = city;
    toast.querySelector('.lat-product').textContent = product;

    toast.classList.remove('lat-hidden');
    toast.classList.add('lat-visible');

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
      toast.classList.remove('lat-visible');
      toast.classList.add('lat-hidden');
    }, 4500);
  }

  // Don't show on cart / checkout / thankYou pages
  var blocked = ['/user/cart', '/checkout', '/thankYou'];
  var path = window.location.pathname;
  var isBlocked = blocked.some(function (b) { return path.indexOf(b) !== -1; });

  if (!isBlocked) {
    // First show after 8s, then every ~35s
    setTimeout(function () {
      showToast();
      setInterval(showToast, 35000);
    }, 8000);
  }
})();
