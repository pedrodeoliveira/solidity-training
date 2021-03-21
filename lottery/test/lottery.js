const Lottery = artifacts.require("Lottery")


contract('Testing with one account', (accounts) => {
    // console.log(accounts);

    let lotteryInstance;

    before('setup the contract instance', async () => {
        lotteryInstance = await Lottery.deployed();
    });

    it('has deployed the contract', async () => {
        assert.ok(lotteryInstance.address);
    });

    it('allows one account to enter the lottery', async () => {

        // enter the lottery with player from account 1
        await lotteryInstance.enter({
            from: accounts[0],
            value: web3.utils.toWei('1')
        });

        // check that player was added to the players list and that list has a single
        // element
        const players = await lotteryInstance.getPlayers();
        assert.equal(1, players.length)
        assert.equal(accounts[0], players[0])
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lotteryInstance.enter({
                from: accounts[0],
                value: 0
            });
            assert(false);
        } catch(error) {
            assert(error);
        }
        
        try {
            await lotteryInstance.enter({
                from: accounts[0],
                value: web3.utils.toWei('0.01')
            });
            assert(false);
        } catch(error) {
            assert(error);
        }        
    });

    it('only the manager to can call pickWinner', async () => {
        for (i = 1; i <= 3; i++) {
            try {
                await lotteryInstance.pickWinner({
                    from: accounts[i],
                });
                assert(false);
            } catch(error) {
                assert(error);
            }   
        }

        // check that the manager can pick the winner
        await lotteryInstance.pickWinner({
            from: accounts[0],
        });
        assert(true);
    });
});

contract('Testing with multiple accounts', (accounts) => {

    let lotteryInstance;

    const numberPlayers = 3

    before('setup the contract instance', async () => {        
        lotteryInstance = await Lottery.deployed();
    });

    it('allows multiple accounts to enter the lottery', async () => {
        // const numberPlayers = 3ß

        // use multiple accounts to enter the lottery
        for (i = 1; i <= numberPlayers; i++ ) {
            await lotteryInstance.enter({
                from: accounts[i],
                value: web3.utils.toWei('1')
            }); 

            // check that each player was added and that
            const players = await lotteryInstance.getPlayers();
            
            // check that the players array has increased by one
            assert.equal(i, players.length);
        }

        // check that each player was added and that
        const players = await lotteryInstance.getPlayers();
        assert.equal(numberPlayers, players.length);

        // check that the contract balance matches the expected value
        const contractBalance = await web3.eth.getBalance(lotteryInstance.address);
        assert.equal(web3.utils.toWei('3'), contractBalance);
    });

    it('sends money to the winner and resets the players array', async () => {
        const initialBalance = await web3.eth.getBalance(lotteryInstance.address);

        let playersInitialBalance = []

        // get the initial balance of the players which entered the game
        for (i = 0; i < numberPlayers; i++ ) {            
            playersInitialBalance[i] = await web3.eth.getBalance(accounts[i+1]);
        }

        // manager picks a winner
        await lotteryInstance.pickWinner({
            from: accounts[0],
        });

        // check that the contract has no ether after the winner has been selected
        const finalBalance = await web3.eth.getBalance(lotteryInstance.address);
        assert.equal(0, finalBalance)

        // check final balances and calculate profit for each account
        let numberPlayersNoProfit = 0;
        let numberPlayersWithProfit = 0;
        let maxProfit = 0;
        for (i = 0; i < numberPlayers; i++) {            
            const finalBalance = await web3.eth.getBalance(accounts[i+1]);
            let profit = finalBalance - playersInitialBalance[i];
            if (profit > 0) {
                maxProfit = profit;
                numberPlayersWithProfit++;
            } else {
                numberPlayersNoProfit++;
            }
        }

        // exactly one player must have a profit
        assert.equal(1, numberPlayersWithProfit);

        // the profit should be equal to the contract initial balance
        assert.equal(initialBalance, maxProfit);

        // the remaining players should have zero profit
        assert.equal(numberPlayers-1, numberPlayersNoProfit);
        
        // verify that players array was reset (length is 0)
        const players = await lotteryInstance.getPlayers();
        assert.equal(0, players.length);
    })
});