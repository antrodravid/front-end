import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [cardNumber, setCardNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [email, setEmail] = useState("metacrafters@gmail.com");
  const [contactNumber, setContactNumber] = useState("764637382");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    if (pin === "9676" && cardNumber === "123456") {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      setIsConnected(true);

      // once wallet is set we can get a reference to our deployed contract
      getATMContract();
    } else {
      alert("Incorrect card number or pin. Please try again.");
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(60);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(25);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!isConnected) {
      return (
        <div>
          <label>
            Card Number:
            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          </label>
          <br />
          <label>
            PIN:
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </label>
          <br />
          <button onClick={connectAccount}>Sign In</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    const maskedCardNumber = "****" + cardNumber.slice(-4);

    return (
      <div className="user-info">
        <div className="top-right">
          <p>Email: {email}</p>
          <p>Card Number: {maskedCardNumber}</p>
          <p>Contact Number: {contactNumber}</p>
        </div>
        {balance !== undefined && <p>Your Balance: {balance} ETH</p>}
        <div className="buttons">
          <button onClick={deposit}>Deposit 60 ETH</button>
          <button onClick={withdraw}>Withdraw 25 ETH</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        body {
          background-color: orange;
          color: white;
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }

        .container {
          text-align: center;
          background-color: orange; // Add this line
        }

        .user-info {
          text-align: left;
          margin-bottom: 20px;
        }

        .top-right {
          position: absolute;
          top: 0;
          right: 0;
          padding: 20px;
        }

        .buttons {
          display: flex;
          flex-direction: row;
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>
    </main>
  );
}
