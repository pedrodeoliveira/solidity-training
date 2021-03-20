const Lottery = artifacts.require("Lottery")


contract('Lottery', (accounts) => {
    console.log(accounts);

    let lottery;

    before(async () => {
        lottery = await Lottery.deployed();
    });

    it('has deployed the contract', async () => {
        assert.ok(lottery.contract.options.address);
    });
});