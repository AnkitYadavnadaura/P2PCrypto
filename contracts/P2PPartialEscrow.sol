// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @title P2PPartialEscrow
 * @notice Minimal Binance-style P2P core for partial fills with dispute + timeout hooks.
 */
contract P2PPartialEscrow {
    enum ListingType {
        BUY,
        SELL
    }

    enum ListingStatus {
        ACTIVE,
        PAUSED,
        CLOSED,
        CANCELLED
    }

    enum OrderStatus {
        CREATED,
        PAID,
        RELEASED,
        CANCELLED,
        DISPUTED
    }

    struct Listing {
        uint256 id;
        address maker;
        ListingType listingType;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 price;
        uint256 minTrade;
        uint256 maxTrade;
        ListingStatus status;
    }

    struct Order {
        uint256 id;
        uint256 listingId;
        address maker;
        address taker;
        uint256 amount;
        uint256 price;
        OrderStatus status;
        uint256 createdAt;
        uint256 paidAt;
    }

    IERC20 public immutable token;
    address public admin;

    uint256 public listingCount;
    uint256 public orderCount;
    uint256 public orderTimeoutSeconds = 30 minutes;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;

    event ListingCreated(
        uint256 indexed listingId,
        address indexed maker,
        ListingType listingType,
        uint256 totalAmount,
        uint256 price,
        uint256 minTrade,
        uint256 maxTrade
    );
    event ListingCancelled(uint256 indexed listingId);

    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed listingId,
        address indexed taker,
        uint256 amount,
        uint256 price
    );
    event OrderPaid(uint256 indexed orderId);
    event OrderReleased(uint256 indexed orderId, address releasedTo);
    event OrderCancelled(uint256 indexed orderId, string reason);
    event OrderDisputed(uint256 indexed orderId);
    event OrderDisputeResolved(uint256 indexed orderId, address winner, uint256 amount);

    event AdminUpdated(address indexed oldAdmin, address indexed newAdmin);
    event TimeoutUpdated(uint256 oldTimeout, uint256 newTimeout);

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    constructor(address tokenAddress, address adminAddress) {
        require(tokenAddress != address(0), "token required");
        require(adminAddress != address(0), "admin required");
        token = IERC20(tokenAddress);
        admin = adminAddress;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "admin required");
        address old = admin;
        admin = newAdmin;
        emit AdminUpdated(old, newAdmin);
    }

    function setOrderTimeout(uint256 newTimeoutSeconds) external onlyAdmin {
        require(newTimeoutSeconds >= 5 minutes, "timeout too low");
        uint256 old = orderTimeoutSeconds;
        orderTimeoutSeconds = newTimeoutSeconds;
        emit TimeoutUpdated(old, newTimeoutSeconds);
    }

    function createListing(
        uint256 totalAmount,
        uint256 price,
        uint8 listingType,
        uint256 minTrade,
        uint256 maxTrade
    ) external {
        require(totalAmount > 0, "amount=0");
        require(price > 0, "price=0");
        require(minTrade > 0 && maxTrade >= minTrade, "invalid limits");
        require(maxTrade <= totalAmount, "max>total");
        require(listingType <= uint8(ListingType.SELL), "invalid type");

        listingCount += 1;
        uint256 id = listingCount;

        listings[id] = Listing({
            id: id,
            maker: msg.sender,
            listingType: ListingType(listingType),
            totalAmount: totalAmount,
            remainingAmount: totalAmount,
            price: price,
            minTrade: minTrade,
            maxTrade: maxTrade,
            status: ListingStatus.ACTIVE
        });

        if (ListingType(listingType) == ListingType.SELL) {
            require(token.transferFrom(msg.sender, address(this), totalAmount), "escrow fail");
        }

        emit ListingCreated(id, msg.sender, ListingType(listingType), totalAmount, price, minTrade, maxTrade);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(l.id != 0, "listing missing");
        require(l.maker == msg.sender, "not maker");
        require(l.status == ListingStatus.ACTIVE || l.status == ListingStatus.PAUSED, "not cancelable");

        l.status = ListingStatus.CANCELLED;

        if (l.listingType == ListingType.SELL && l.remainingAmount > 0) {
            require(token.transfer(l.maker, l.remainingAmount), "refund fail");
            l.remainingAmount = 0;
        }

        emit ListingCancelled(listingId);
    }

    function joinListing(uint256 listingId, uint256 amount) external {
        Listing storage l = listings[listingId];
        require(l.id != 0, "listing missing");
        require(l.status == ListingStatus.ACTIVE, "listing inactive");
        require(msg.sender != l.maker, "maker cannot take own listing");

        require(amount >= l.minTrade, "below min");
        require(amount <= l.maxTrade, "above max");
        require(amount <= l.remainingAmount, "not enough remaining");

        l.remainingAmount -= amount;
        if (l.remainingAmount == 0) {
            l.status = ListingStatus.CLOSED;
        }

        orderCount += 1;
        uint256 orderId = orderCount;

        orders[orderId] = Order({
            id: orderId,
            listingId: listingId,
            maker: l.maker,
            taker: msg.sender,
            amount: amount,
            price: l.price,
            status: OrderStatus.CREATED,
            createdAt: block.timestamp,
            paidAt: 0
        });

        // BUY listing escrows taker tokens when order is opened.
        if (l.listingType == ListingType.BUY) {
            require(token.transferFrom(msg.sender, address(this), amount), "buyer escrow fail");
        }

        emit OrderCreated(orderId, listingId, msg.sender, amount, l.price);
    }

    function markPaid(uint256 orderId) external {
        Order storage o = orders[orderId];
        require(o.id != 0, "order missing");
        require(o.status == OrderStatus.CREATED, "invalid status");

        Listing storage l = listings[o.listingId];
        if (l.listingType == ListingType.SELL) {
            require(msg.sender == o.taker, "only taker for SELL");
        } else {
            require(msg.sender == o.maker, "only maker for BUY");
        }

        o.status = OrderStatus.PAID;
        o.paidAt = block.timestamp;
        emit OrderPaid(orderId);
    }

    function release(uint256 orderId) external {
        Order storage o = orders[orderId];
        require(o.id != 0, "order missing");
        require(o.status == OrderStatus.PAID, "not paid");

        Listing storage l = listings[o.listingId];
        address releaseTo;

        if (l.listingType == ListingType.SELL) {
            require(msg.sender == o.maker, "only maker for SELL");
            releaseTo = o.taker;
        } else {
            require(msg.sender == o.taker, "only taker for BUY");
            releaseTo = o.maker;
        }

        o.status = OrderStatus.RELEASED;
        require(token.transfer(releaseTo, o.amount), "release fail");
        emit OrderReleased(orderId, releaseTo);
    }

    function cancelOrder(uint256 orderId) external {
        Order storage o = orders[orderId];
        require(o.id != 0, "order missing");
        require(o.status == OrderStatus.CREATED || o.status == OrderStatus.PAID, "not cancelable");
        require(msg.sender == o.maker || msg.sender == o.taker, "not participant");

        _cancelOrderAndRefund(orderId, "manual_cancel");
    }

    function autoCancelExpired(uint256 orderId) external {
        Order storage o = orders[orderId];
        require(o.id != 0, "order missing");
        require(o.status == OrderStatus.CREATED, "status must be created");
        require(block.timestamp > o.createdAt + orderTimeoutSeconds, "not expired");

        _cancelOrderAndRefund(orderId, "timeout");
    }

    function openDispute(uint256 orderId) external {
        Order storage o = orders[orderId];
        require(o.id != 0, "order missing");
        require(o.status == OrderStatus.CREATED || o.status == OrderStatus.PAID, "cannot dispute");
        require(msg.sender == o.maker || msg.sender == o.taker, "not participant");

        o.status = OrderStatus.DISPUTED;
        emit OrderDisputed(orderId);
    }

    function resolveDispute(uint256 orderId, bool releaseToTaker) external onlyAdmin {
        Order storage o = orders[orderId];
        require(o.id != 0, "order missing");
        require(o.status == OrderStatus.DISPUTED, "not disputed");

        o.status = OrderStatus.RELEASED;

        address winner = releaseToTaker ? o.taker : o.maker;
        require(token.transfer(winner, o.amount), "dispute release fail");

        emit OrderDisputeResolved(orderId, winner, o.amount);
    }

    function _cancelOrderAndRefund(uint256 orderId, string memory reason) internal {
        Order storage o = orders[orderId];
        o.status = OrderStatus.CANCELLED;

        Listing storage l = listings[o.listingId];
        l.remainingAmount += o.amount;
        if (l.status == ListingStatus.CLOSED) {
            l.status = ListingStatus.ACTIVE;
        }

        if (l.listingType == ListingType.SELL) {
            require(token.transfer(o.maker, o.amount), "maker refund fail");
        } else {
            require(token.transfer(o.taker, o.amount), "taker refund fail");
        }

        emit OrderCancelled(orderId, reason);
    }
}
