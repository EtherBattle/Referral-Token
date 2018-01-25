pragma solidity ^0.4.19;


/**
 * @title Referral Token Contract
 * @author Alex 'AL_X' Papageorgiou
 * @dev The REF ERC-20 & ERC-223 Compliant Token Contract
 */
contract REFToken {
    string public name = "Referral Token";
    string public symbol = "REF";
    address public admin;
    uint8 public decimals = 3;
    uint256 private decimalMultiplier = 10**3;
    //Maximum supply achievable: 1.000.000.000 REF after 1 million referrals
    uint256 public totalSupply = 0;
    uint256 public referralReward = 1000*decimalMultiplier;
    bool private running;
    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;
    //If this equals to 0x0 it means that the user hasn't been referred
    mapping(address => address) referrer;
    //Referral name service, allowing you to claim a name for referrals instead of your ETH address
    mapping(bytes32 => address) RNS;
    mapping(address => uint256) totalReferrals;
    
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    /**
     * @notice Ensures admin is caller
     */
    modifier isAdmin() {
        require(msg.sender == admin);
        _;
    }

    /**
    * @notice Re-entry protection
    */
    modifier isRunning() {
        require(!running);
        running = true;
        _;
        running = false;
    }

    /**
     * @notice SafeMath Library safeSub Import
     * @dev
            Since we are dealing with a limited currency
            circulation of 270 million tokens and values
            that will not surpass the uint256 limit, only
            safeSub is required to prevent underflows.
    */
    function safeSub(uint256 a, uint256 b) internal pure returns (uint256 z) {
        assert((z = a - b) <= a);
    }
    /**
     * @notice REF Constructor
     * @dev
            Constructor initializing the first referrer on the system. 
            No pre-allocated tokens are rewarded to us.
    */
    function REFToken() public {
        referrer[msg.sender] = msg.sender;
        totalReferrals[msg.sender] = 1;
        RNS["REF"] = msg.sender;
    }

    /**
     * @notice Check the name of the token ~ ERC-20 Standard
     * @return {
                    "_name": "The token name"
                }
     */
    function name() external constant returns (string _name) {
        return name;
    }

    /**
     * @notice Check the symbol of the token ~ ERC-20 Standard
     * @return {
                    "_symbol": "The token symbol"
                }
     */
    function symbol() external constant returns (string _symbol) {
        return symbol;
    }

    /**
     * @notice Check the decimals of the token ~ ERC-20 Standard
     * @return {
                    "_decimals": "The token decimals"
                }
     */
    function decimals() external constant returns (uint8 _decimals) {
        return decimals;
    }

    /**
     * @notice Check the total supply of the token ~ ERC-20 Standard
     * @return {
                    "_totalSupply": "Total supply of tokens"
                }
     */
    function totalSupply() external constant returns (uint256 _totalSupply) {
        return totalSupply;
    }

    /**
     * @notice Query the available balance of an address ~ ERC-20 Standard
     * @param _owner The address whose balance we wish to retrieve
     * @return {
                    "balance": "Balance of the address"
                }
     */
    function balanceOf(address _owner) external constant returns (uint256 balance) {
        return balances[_owner];
    }
    /**
     * @notice Query the amount of tokens the spender address can withdraw from the owner address ~ ERC-20 Standard
     * @param _owner The address who owns the tokens
     * @param _spender The address who can withdraw the tokens
     * @return {
                    "remaining": "Remaining withdrawal amount"
                }
     */
    function allowance(address _owner, address _spender) external constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    /**
     * @notice Transfer tokens from an address to another ~ ERC-20 Standard
     * @param _from The address whose balance we will transfer
     * @param _to The recipient address
     * @param _value The amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value) external {
        var _allowance = allowed[_from][_to];
        balances[_to] = balances[_to]+_value;
        balances[_from] = safeSub(balances[_from], _value);
        allowed[_from][_to] = safeSub(_allowance, _value);
        Transfer(_from, _to, _value);
    }

    /**
     * @notice Authorize an address to retrieve funds from you ~ ERC-20 Standard
     * @dev
            Each approval comes with a default cooldown of 30 minutes
            to prevent against the ERC-20 race attack.
     * @param _spender The address you wish to authorize
     * @param _value The amount of tokens you wish to authorize
     */
    function approve(address _spender, uint256 _value) external {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
    }

    /**
     * @notice Transfer the specified amount to the target address ~ ERC-20 Standard
     * @dev
            A boolean is returned so that callers of the function
            will know if their transaction went through.
     * @param _to The address you wish to send the tokens to
     * @param _value The amount of tokens you wish to send
     * @return {
                    "success": "Transaction success"
                }
     */
    function transfer(address _to, uint256 _value) external isRunning returns (bool success){
        bytes memory empty;
        if (_to == address(this)) {
            revert();
        } else if (isContract(_to)) {
            return transferToContract(_to, _value, empty);
        } else {
            return transferToAddress(_to, _value, empty);
        }
    }

    /**
     * @notice Check whether address is a contract ~ ERC-223 Proposed Standard
     * @param _address The address to check
     * @return {
                    "is_contract": "Result of query"
                }
     */
    function isContract(address _address) internal view returns (bool is_contract) {
        uint length;
        assembly {
            length := extcodesize(_address)
        }
        return length > 0;
    }

    /**
     * @notice Transfer the specified amount to the target address with embedded bytes data ~ ERC-223 Proposed Standard
     * @dev Includes an extra buyWallet function to handle wallet purchases
     * @param _to The address to transfer to
     * @param _value The amount of tokens to transfer
     * @param _data Any extra embedded data of the transaction
     * @return {
                    "success": "Transaction success"
                }
     */
    function transfer(address _to, uint256 _value, bytes _data) external isRunning returns (bool success) {
        if (_to == address(this)) {
            revert();
        } else if (isContract(_to)) {
            return transferToContract(_to, _value, _data);
        } else {
            return transferToAddress(_to, _value, _data);
        }
    }

    /**
     * @notice Handles transfer to an ECA (Externally Controlled Account), a normal account ~ ERC-223 Proposed Standard
     * @param _to The address to transfer to
     * @param _value The amount of tokens to transfer
     * @param _data Any extra embedded data of the transaction
     * @return {
                    "success": "Transaction success"
                }
     */
    function transferToAddress(address _to, uint256 _value, bytes _data) internal returns (bool success) {
        balances[msg.sender] = safeSub(balances[msg.sender], _value);
        balances[_to] = balances[_to]+_value;
        Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @notice Handles transfer to a contract ~ ERC-223 Proposed Standard
     * @param _to The address to transfer to
     * @param _value The amount of tokens to transfer
     * @param _data Any extra embedded data of the transaction
     * @return {
                    "success": "Transaction success"
                }
     */
    function transferToContract(address _to, uint256 _value, bytes _data) internal returns (bool success) {
        balances[msg.sender] = safeSub(balances[msg.sender], _value);
        balances[_to] = balances[_to]+_value;
        REFToken rec = REFToken(_to);
        rec.tokenFallback(msg.sender, _value, _data);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @notice Empty tokenFallback method to ensure ERC-223 compatibility
     * @param _sender The address who sent the ERC-223 tokens
     * @param _value The amount of tokens the address sent to this contract
     * @param _data Any embedded data of the transaction
     */
    function tokenFallback(address _sender, uint256 _value, bytes _data) public {}

    /**
     * @notice Retrieve ERC Tokens sent to contract
     * @dev Feel free to contact us and retrieve your ERC tokens should you wish so.
     * @param _token The token contract address
     */
    function claimTokens(address _token) isAdmin external {
        require(_token != address(this));
        REFToken token = REFToken(_token);
        uint balance = token.balanceOf(this);
        token.transfer(admin, balance);
    }
    
    /**
     * @notice Mine tokens by being referred
     * @dev 
     *      This function gives your referrer & you a token reward 
     *      for joining the system, thus making the coin linearily
     *      mineable.
     * 
     * @param _referrer The address of the user who referred you
     */
    function refer(address _referrer) external {
        require(referrer[_referrer] != 0x0 && referrer[msg.sender] == 0x0);
        referrer[msg.sender] = _referrer;
        totalReferrals[_referrer]++;
        balances[msg.sender] += referralReward--;
        balances[_referrer] += referralReward--;
    }
    
    /**
     * @notice Mine tokens by being referred
     * @dev 
     *      This function gives your referrer & you a token reward 
     *      for joining the system, thus making the coin linearily
     *      mineable.
     * 
     * @param _nickname The RNS reserved nickname of the user who referred you
     */
    function referByRNS(bytes32 _nickname) external {
        require(referrer[RNS[_nickname]] != 0x0 && referrer[msg.sender] == 0x0);
        referrer[msg.sender] = RNS[_nickname];
        totalReferrals[RNS[_nickname]]++;
        balances[msg.sender] += referralReward--;
        balances[RNS[_nickname]] += referralReward--;
    }
    
    /**
     * @notice Reserve RNS nickname
     * @dev 
     *      This function enables you to claim an RNS nickname
     *      making it easier for users to be referred by you 
     *      using just a name.
     * 
     * @param _nickname The RNS nickname to reserve
     */
    function reserveRNS(bytes32 _nickname) payable external {
        require(msg.value >= (1 ether)/100 && RNS[_nickname] == 0x0);
        RNS[_nickname] = msg.sender;
    }
}
