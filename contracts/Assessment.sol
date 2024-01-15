// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => uint256) public bondBalance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event BuyBonds(address indexed buyer, uint256 amount);
    event RedeemBonds(address indexed redeemer, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");

        uint256 _previousBalance = balance;
        balance += _amount;

        assert(balance == _previousBalance + _amount);

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;

        if (balance < _withdrawAmount) {
            revert InsufficientBalance({ balance: balance, withdrawAmount: _withdrawAmount });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        emit Withdraw(_withdrawAmount);
    }

    function buyBonds(uint256 _bondAmount) public {
        require(_bondAmount > 0, "Bond amount must be greater than 0");

        uint256 _previousBalance = balance;
        require(_previousBalance >= _bondAmount, "Insufficient funds to buy bonds");

        // Deduct bond amount from the balance
        balance -= _bondAmount;

        // Add the bond amount to the bond balance of the buyer
        bondBalance[msg.sender] += _bondAmount;

        emit BuyBonds(msg.sender, _bondAmount);
    }

    function redeemBonds(uint256 _bondAmount) public {
        require(_bondAmount > 0, "Redemption amount must be greater than 0");

        uint256 _previousBondBalance = bondBalance[msg.sender];
        require(_previousBondBalance >= _bondAmount, "Insufficient bonds to redeem");

        // Deduct the bond amount from the bond balance
        bondBalance[msg.sender] -= _bondAmount;

        // Add the bond amount to the balance
        balance += _bondAmount;

        emit RedeemBonds(msg.sender, _bondAmount);
    }
}
