// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BKDDokumenRegistri
 * @notice Jejak audit on-chain untuk siklus dokumen BKD: unggah, terapkan, hapus.
 * @dev Hanya emit event. Isi dokumen tidak pernah menyentuh chain, cukup
 *      hash-nya (sha256 berkas, atau keccak256 URL untuk bukti berupa tautan).
 *      Waktu kejadian dibaca dari timestamp block, tidak disimpan di event.
 */
contract BKDDokumenRegistri is AccessControl {
    bytes32 public constant PENCATAT_ROLE = keccak256("PENCATAT_ROLE");

    error InvalidAddress();
    error InvalidHash();

    event DokumenTercatat(
        address indexed operator,
        bytes32 indexed hashDokumen,
        string aksi,
        string referensi
    );

    constructor(address admin, address initialPencatat) {
        if (admin == address(0) || initialPencatat == address(0)) {
            revert InvalidAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PENCATAT_ROLE, initialPencatat);
    }

    /**
     * @notice Catat satu peristiwa dokumen.
     * @param hashDokumen Hash isi dokumen (sha256/keccak256), identitas berkas.
     * @param aksi Jenis peristiwa: "unggah" | "terapkan" | "hapus".
     * @param referensi Penunjuk baris di sistem, mis. "unggahan:<id>" atau "bukti:<id>".
     */
    function catat(
        bytes32 hashDokumen,
        string calldata aksi,
        string calldata referensi
    ) external onlyRole(PENCATAT_ROLE) {
        if (hashDokumen == bytes32(0)) revert InvalidHash();

        emit DokumenTercatat(msg.sender, hashDokumen, aksi, referensi);
    }
}
