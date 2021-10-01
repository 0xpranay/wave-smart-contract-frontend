import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import contractABI from './utils/WavePortal.json';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");


  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x210692EBE49EA56Ce33E14f603391aB8fEE11a1f";
  
  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();

        const provider1 = ethers.getDefaultProvider("rinkeby");
        const waveportalContract = new ethers.Contract(contractAddress, contractABI.abi, provider1);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await waveportalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);

        waveportalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getTotalWaves()
  {
    console.log("Getting all waves");
    const contractAddress = "0x210692EBE49EA56Ce33E14f603391aB8fEE11a1f";

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const waveportalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        let arr  = await waveportalContract.getTotalWaves();
        
        let count = arr[0];
        let specific = arr[1];
        document.getElementById('total').innerHTML = `Total waves: ${count} 👋`;
        document.getElementById('your').innerHTML = `Your waves: ${specific} 👋`;
        document.getElementById('your').style.display = "inline";

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  function waitTransaction()
  {
    document.getElementById('show').style.display = "none";
    document.getElementById('waiting').style.display = "inline";
  }
  function showTransaction(txnhash)
  {
    document.getElementById('waiting').style.display = "none";
    document.getElementById('show').style.display = "inline";
    var a = document.getElementById('show');
    a.href = "https://rinkeby.etherscan.io/tx/" + txnhash;
  }

  if(currentAccount)
  {
    getTotalWaves();
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        document.getElementById('connected').innerHTML += accounts[0];
        document.getElementById('connected').style.display = "inline";
        document.getElementById('messageBox').style.display = "inline";

        await getTotalWaves();

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      getTotalWaves();
      console.log("Connected", accounts[0]);

      document.getElementById('connected').innerHTML += accounts[0];
      document.getElementById('connected').style.display = "inline";

      document.getElementById('messageBox').style.display = "inline";

      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    const contractAddress = "0x210692EBE49EA56Ce33E14f603391aB8fEE11a1f";
    
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * You are defining contractABI right here. Let's change this!
        */
        
        const waveportalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        let count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count[0]);

        
        let message = document.getElementById("messageBox").value
        const waveTxn = await waveportalContract.wave(message, {gasLimit:300000});
        console.log("Mining...", waveTxn.hash);

        waitTransaction();
        await waveTxn.wait();
        showTransaction(waveTxn.hash);
        
        console.log("Mined -- ", waveTxn.hash);

        waveportalContract.on("userWon", (flag_number) => {
          console.log("userWon", flag_number);
          document.getElementById('color-text').innerHTML = "Congrats, You won 0.0001 ETH! Try once again?";
        });


        await getTotalWaves();
      
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}
  useEffect(() => {
    checkIfWalletIsConnected();
  })
  
   useEffect(() => {
      getAllWaves();
    }, [currentAccount])


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 <span id="color-text">Wave, There's never enough friends!</span>

        </div>

        <div className="bio">
        I am Pranay and I'm new to web3. I hope to build exciting things here and let's be friends!
        </div>

        <button className="waveButton" onClick={wave}>
          <span id="primary">Wave 👋 </span><span id="secondary">Test your luck! 🍀</span>
        </button>

        <textarea id="messageBox" placeholder="Enter a message and press Wave 👋. You have 80% chance to win 0.0001 ETH!"></textarea>

        {!currentAccount && (
          <button className="waveButton upperRight" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        
        {allWaves.slice(0).reverse().map((wave, index) => {
                    return (
                        <div key={index} style={{ marginTop: "16px", padding: "8px" }} className="box">
                            <div>Address: {wave.address}</div>
                            <div>Time: {wave.timestamp.toString()}</div>
                            <div>Message: {wave.message}</div>
                        </div>)
                })}


                
      </div>
    </div>

  );
}

export default App
