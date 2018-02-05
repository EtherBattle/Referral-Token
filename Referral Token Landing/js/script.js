var animate = new Animate({
	target: '[data-animate]'
});
animate.init();

/**
 * refererAddress: the guy that gets the tokens
 * newAddress: the new guy
 */
function refer(refererAddress, newAddress) {
	var message = "<p><a href='https://etherscan.io/address/" + refererAddress + "' target='_blank' class='hexAddress'>" + refererAddress + "</a> referred <a href='https://etherscan.io/address/" + newAddress + "' class='hexAddress' target='_blank'>" + newAddress + "</a> to our token and received 20 REF tokens!</p>";

	// create the notification
	var notification = new NotificationFx({
		message: message,
		layout: 'growl',
		effect: 'jelly',
		type: 'notice', // notice, warning, error or success
		ttl: 6000 // time to live
	});

	// show the notification
	notification.show();
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

(function() {
	// added click on logo for convenience, change to actual button
	var logo = document.getElementsByClassName('logo')[0];
	logo.addEventListener('click', function() {
		refer('0x5baeac0a0417a05733884852aa068b706967e790', '0x47ea853884303e0fd95fe5fc296be7051b3d8028');
	});

	if (window.location.href.indexOf("ref=") != -1) {
		var localWeb3;

		var contractInstance;

		if (typeof window.web3 === 'undefined' || typeof window.web3.currentProvider === 'undefined') {
			showAlert("<a style='color:rgba(255,255,255,0.8);text-decoration:none;cursor: url(../img/altc2.png), auto;' target='_blank' href='https://metamask.io/'>You should install metamask</a>");
		} else {
			localWeb3 = new Web3(window.web3.currentProvider);

			var contractAddress = "0x8cc5da3bae2f7222888c11fca0459c7ea4c848c5";
			var contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"_name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"_totalSupply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_referrer","type":"address"}],"name":"refer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_nickname","type":"bytes32"}],"name":"referByRNS","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"_decimals","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"referralReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nickname","type":"bytes32"}],"name":"reserveRNS","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"_symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"tokenFallback","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"retrieveInfo","outputs":[{"name":"_totalSupply","type":"uint256"},{"name":"_referralReward","type":"uint256"},{"name":"referrals","type":"uint256"},{"name":"balance","type":"uint256"},{"name":"nickname","type":"bytes32"},{"name":"isReferred","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"claimTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
			contractInstance = localWeb3.eth.contract(contractABI).at(contractAddress);

			delete contractAddress;
			delete contractABI;

			document.getElementById("user-id").innerHTML = window.location.href.substring(window.location.href.indexOf("ref=")+4);
			contractInstance.retrieveInfo(function(err,result) {
				if (!err) {
				  if (result[6]) {
						showAlert("You are already referred.");
				  } else {
						document.getElementById("reward").innerHTML = result[1].div(10**3).toString(10);
					}
				} else {
					showAlert("Data Retrieval Failure. Send us an e-mail at support@ref-token.io");
					console.log(err);
				}
			});

			window.web3.eth.getAccounts(function (err, accounts) {
				if (!accounts[0]) {
					showAlert("Please unlock your Metamask wallet");
					watchAccountUnlock();
				} else {
					localWeb3.eth.defaultAccount = accounts[0];
					localWeb3.version.getNetwork((err, netId) => {
						if (netId != 1) {
							showAlert("Please switch to the main-net");
							watchNetChange();
						} else {
							showOverlay();
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
								showOverlay();
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
						showOverlay();
						clearInterval(toClear);
					}
				});
			},500);
		}

		function showOverlay() {
			document.getElementById("overlay").className = "show";
		}

		var beginRef = function() {
			var referrer = window.location.href.substring(window.location.href.indexOf("ref=")+4);
			if (referrer.startsWith("0x")) {
				contractInstance.referByRNS(referrer, function(err,result) {
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
					document.getElementById("overlay").className = "";
				});
			} else {
				contractInstance.refer(referrer, function(err,result) {
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
					document.getElementById("overlay").className = "";
				});
			}
		}

		window.referMe = beginRef;
	}
})();
