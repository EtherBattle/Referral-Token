var blockchainData = [0, 0, 0, 0, 0, ""];

var tokenPrice = 0.0123;

var letters;

var localWeb3;

var contractInstance;

if (typeof window.web3 === 'undefined' || typeof window.web3.currentProvider === 'undefined') {
	showAlert("No Metamask Detected");
	setTimeout(function(){
		window.location = "file:///C:/Users/wbc1/Desktop/Referral%20Token%20Landing/index.html";
	},4000);
} else {
	localWeb3 = new Web3(window.web3.currentProvider);

	var contractAddress = "0x8cc5da3bae2f7222888c11fca0459c7ea4c848c5";
	var contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"_name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"_totalSupply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_referrer","type":"address"}],"name":"refer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_nickname","type":"bytes32"}],"name":"referByRNS","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"_decimals","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"referralReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nickname","type":"bytes32"}],"name":"reserveRNS","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"_symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"tokenFallback","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"retrieveInfo","outputs":[{"name":"_totalSupply","type":"uint256"},{"name":"_referralReward","type":"uint256"},{"name":"referrals","type":"uint256"},{"name":"balance","type":"uint256"},{"name":"nickname","type":"bytes32"},{"name":"isReferred","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"claimTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
	contractInstance = localWeb3.eth.contract(contractABI).at(contractAddress);

	delete contractAddress;
	delete contractABI;

	window.web3.eth.getAccounts(function (err, accounts) {
		if (!accounts[0]) {
			showAlert("Please unlock your Metamask wallet"); //make success to error
			watchAccountUnlock();
		} else {
			localWeb3.eth.defaultAccount = accounts[0];
			localWeb3.version.getNetwork((err, netId) => {
				if (netId != 1) {
					showAlert("Please switch to the main-net");
					watchNetChange();
				} else {
					getBlockchainData();
				}
			});
		}
	});
}

function watchAccountUnlock() {
	var toClear = setInterval(function() {
		window.web3.eth.getAccounts(function (err, accounts) {
			if (accounts[0] != localWeb3.eth.defaultAccount) {
				localWeb3.eth.defaultAccount = accounts[0];
				localWeb3.version.getNetwork((err, netId) => {
					if (netId != 1) {
						showAlert("Please switch to the main-net");
						watchNetChange();
					} else {
						getBlockchainData();
					}
				});
				clearInterval(toClear);
			}
		});
	},500);
}

function watchNetChange() {
	var toClear = setInterval(function() {
		localWeb3.version.getNetwork((err, netId) => {
			if (netId == 1) {
				getBlockchainData();
				clearInterval(toClear);
			}
		});
	},500);
}

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
document.querySelectorAll(".main-ui-component")[0].style.minWidth = "calc("+(w - (document.querySelectorAll(".ui-component")[0].getBoundingClientRect().left + (w - document.querySelectorAll(".ui-component")[2].getBoundingClientRect().right))) + "px - calc(4px + 4vmax))";

delete w;

function beginIntro() {
	document.getElementById("loader").style.opacity = 0;
	setTimeout(function(){
		document.getElementById("loader").outerHTML = "";
	},1000);
	initAnim();
}

function getBlockchainData() {
	contractInstance.retrieveInfo(function(err,result) {
		if (!err) {
			blockchainData[0] = result[0].div(10**3).toString(10);
			blockchainData[1] = result[1].div(10**3).toString(10);
			blockchainData[2] = result[2].toString(10);
			blockchainData[3] = result[3].div(10**3).toString(10);
			blockchainData[4] = blockchainData[3]*tokenPrice;
			blockchainData[5] = result[5].toString(10) == ""?localWeb3.eth.defaultAccount:result[5].toString(10);

		  if (!result[6]) {
				showAlert("You have not been referred to the platform yet.");
				setTimeout(function(){
					window.location = "file:///C:/Users/wbc1/Desktop/Referral%20Token%20Landing/index.html";
				},4000);
		  } else {
				document.getElementById("to-copy").value = "file:///C:/Users/wbc1/Desktop/Referral%20Token%20Landing/index.html?ref=" + blockchainData[5];

				var message = "Welcome "+blockchainData[5];
				var final = "";
				for (var i = 0; i < message.length; i++) {
					final += "<span>" + (message.charAt(i) == " "?"&nbsp;":message.charAt(i)) + "</span>";
				}
				document.querySelectorAll(".welcome-message")[0].innerHTML = final;
				letters = document.querySelectorAll(".welcome-message span");

				delete final;
				delete message;
				beginIntro();
			}
		} else {
			showAlert("Data Retrieval Failure. Send us an e-mail at support@ref-token.io");
			console.log(err);
		}
	});

	// blockchainData[0] = 1324555;
	// blockchainData[1] = 943.32;
	// blockchainData[2] = 125;
	// blockchainData[3] = 125523;
	// blockchainData[4] = 2000.32;
	// blockchainData[5] = "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe";
  //
	// document.getElementById("to-copy").value = "file:///C:/Users/wbc1/Desktop/Referral%20Token%20Landing/index.html?ref=" + blockchainData[5];
  //
	// var message = "Welcome "+blockchainData[5];
	// var final = "";
	// for (var i = 0; i < message.length; i++) {
	// 	final += "<span>" + (message.charAt(i) == " "?"&nbsp;":message.charAt(i)) + "</span>";
	// }
	// document.querySelectorAll(".welcome-message")[0].innerHTML = final;
	// letters = document.querySelectorAll(".welcome-message span");
  //
	// delete final;
	// delete message;
  //
	// beginIntro();
}

function initAnim() {
	var delay = 500;
	for (var i = 0; i < letters.length; i++) {
		delayAnim(i, delay);
		delay += 30;
	}
	document.querySelectorAll(".accent")[0].style.transform = "translate(0,0)";
	document.querySelectorAll(".accent")[1].style.transform = "translate(0,0)";
}

function delayAnim(index, delay) {
	setTimeout(function() {
		letters[index].style.transform = "translateX(0px)";
		letters[index].style.opacity = "1";
		if (index == letters.length - 1) {
			setTimeout(function(){
				document.querySelectorAll(".welcome-message span").forEach(function(el){
					el.style.transition = "all 1.2s cubic-bezier(0.95, 0.05, 0.795, 0.035)"
				});
				initReverseAnim();
			},100);
		}
	}, delay);
}

function initReverseAnim() {
	var delay = 100;
	for (var i = 0; i < letters.length; i++) {
		delayReverseAnim(i, delay);
		delay += 30;
	}
}

function delayReverseAnim(index, delay) {
	setTimeout(function() {
		letters[index].style.transform = "translateX(-30px)";
		letters[index].style.opacity = "0";
		if (index == letters.length - 1) {
			setTimeout(function(){
				letters[0].parentNode.outerHTML = "";
				showUI();
			},1200);
		}
	}, delay);
}

function showUI() {
	document.querySelectorAll(".to-animate").forEach(function(el, i){
		setTimeout(function(){
  		el.className += " fade-in-upwards";
		}, i*250);
		if (arguments[2].length-1 == i) {
			countEmUp();
		}
	});
}

function countEmUp() {
	var indexer = document.querySelectorAll('.count-em');
	var options = {
	  useEasing: true,
	  useGrouping: true,
	  separator: ',',
	  decimal: '.',
	  suffix: ' REF'
	};
	var demo = new CountUp(indexer[0], blockchainData[0]-(blockchainData[0]/10), blockchainData[0], 2, 2.5, options);
	if (!demo.error) demo.start();
	demo = new CountUp(indexer[1], blockchainData[1]-(blockchainData[1]/10), blockchainData[1], 2, 2.5, options);
	if (!demo.error) demo.start();
	demo = new CountUp(indexer[3], blockchainData[3]-(blockchainData[3]/10), blockchainData[3], 2, 2.5, options);
	if (!demo.error) demo.start();
	options = {
	  useEasing: true,
	  useGrouping: true,
	  separator: '.'
	};
	demo = new CountUp(indexer[2], 0, blockchainData[2], 0, 2.5, options);
	if (!demo.error) demo.start();
	options = {
	  useEasing: true,
	  useGrouping: true,
	  separator: ',',
	  decimal: '.',
		prefix: '$'
	};
	demo = new CountUp(indexer[4], blockchainData[4]-(blockchainData[4]/10), blockchainData[4], 2, 2.5, options);
	if (!demo.error) demo.start();
}

function showRNSModal() {
	document.getElementById("overlay").className = "show";
	document.querySelectorAll(".input-box")[0].focus();
}

function claimRNS(nickname) {
	document.getElementById("overlay").className = "";
	contractInstance.reserveRNS(nickname, function(err,result) {
		if (!err) {
			var previousText = document.getElementById("success").innerHTML;
			document.getElementById("success").innerHTML = "<i class='fas fa-check'></i> TX Successfully Broadcasted: <a style='color:rgba(255,255,255,0.8);text-decoration:none;cursor: url(../img/altc2.png), auto;' target='_blank' href='https://etherscan.io/tx/"+result+"'>"+result+"</a>";
			document.getElementById("success").className = " show";
			setTimeout(function(){
				document.getElementById("success").className = "";
				setTimeout(function(){
					document.getElementById("success").innerHTML = previousText;
				}, 1000);
			}, 2500);
		} else {
			console.error(err);
			showAlert("TX Rejected/Error Occured");
		}
	});
}

function copyLink() {
	document.getElementById("to-copy").select();
	document.execCommand("Copy");
	document.getElementById("success").className = " show";
	setTimeout(function(){
		document.getElementById("success").className = "";
	}, 2500);
}

function showAlert(text) {
	var previousText = document.getElementById("success").innerHTML;
	document.getElementById("success").innerHTML = "<i class='fas fa-times'></i> " + text;
	setTimeout(function(){
		document.getElementById("success").className = " show error";
		setTimeout(function(){
			document.getElementById("success").className = "error";
			setTimeout(function(){
				document.getElementById("success").className = "";
				document.getElementById("success").innerHTML = previousText;
			},1000);
		}, 2500);
	}, 100);
}
