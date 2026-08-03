// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BKDSKSToken
 * @notice Token SKS non-transferable untuk representasi hasil perhitungan BKD.
 * @dev Hanya wallet dengan MINTER_ROLE yang dapat mint.
 *      Token tidak dapat ditransfer antar pengguna.
 */
contract BKDSKSToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error TokenNonTransferable();
    error InvalidAddress();

    event SKSMinted(
        address indexed operator,
        address indexed recipient,
        uint256 amount,
        string referenceId
    );

    event SKSBurned(
        address indexed operator,
        address indexed account,
        uint256 amount,
        string reason
    );

    constructor(address admin, address initialMinter)
        ERC20("BKD SKS Token", "SKS")
    {
        if (admin == address(0) || initialMinter == address(0)) {
            revert InvalidAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, initialMinter);
    }

    /**
     * @notice Mint token SKS ke dosen/penerima.
     * @param to Alamat penerima token.
     * @param amount Jumlah token.
     * @param referenceId Referensi perhitungan BKD, mis. ID periode atau ID hasil evaluasi.
     */
    function mint(
        address to,
        uint256 amount,
        string calldata referenceId
    ) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert InvalidAddress();
        require(amount > 0, "Amount must be > 0");

        _mint(to, amount);

        emit SKSMinted(msg.sender, to, amount, referenceId);
    }

    /**
     * @notice Burn token untuk koreksi nilai.
     * @dev Opsional. Hanya admin yang boleh burn.
     */
    function burn(
        address account,
        uint256 amount,
        string calldata reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        require(amount > 0, "Amount must be > 0");

        _burn(account, amount);

        emit SKSBurned(msg.sender, account, amount, reason);
    }

    /**
     * @dev Override hook transfer OpenZeppelin v5.
     *      Hanya mengizinkan mint (from = 0) dan burn (to = 0).
     *      Transfer antar-wallet ditolak.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        // izinkan mint
        if (from == address(0)) {
            super._update(from, to, value);
            return;
        }

        // izinkan burn
        if (to == address(0)) {
            super._update(from, to, value);
            return;
        }

        // selain itu, transfer dilarang
        revert TokenNonTransferable();
    }
}