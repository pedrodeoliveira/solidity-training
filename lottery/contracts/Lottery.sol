// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Lottery {

    address public manager;

    // addresses of players to which we can send ether
    address payable[] public players;

    constructor() public {
        manager = msg.sender;
    }

    function enter() public payable {

        // validate that the amount sent is above a threshold
        require(msg.value > 0.01 ether);

        // store sender's address in players array
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        // call this global function
        bytes32 hash = keccak256(abi.encodePacked(block.difficulty, block.timestamp, players));
        return uint(hash);
    }

    function pickWinner() public onlyOwner{

        // randomly select the winner using the internal random func
        uint index = random() % players.length;

        // transfer the entire balance to the randomly chosen player (index)
        players[index].transfer(address(this).balance);

        // reset players array to an empty dynamic array
        players = new address payable[](0);
    }

    modifier onlyOwner() {
        // validate that the sender is the manager
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address payable[] memory) {
        address payable[] memory _players = players;
        return _players;
    }
}