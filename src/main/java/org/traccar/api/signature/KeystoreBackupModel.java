/*
 * Backup model for malformed keystore entries
 */
package org.traccar.api.signature;

import org.traccar.model.BaseModel;
import org.traccar.storage.StorageName;

import java.util.Date;

@StorageName("tc_keystore_backup")
public class KeystoreBackupModel extends BaseModel {

    private long originalId;

    public long getOriginalId() {
        return originalId;
    }

    public void setOriginalId(long originalId) {
        this.originalId = originalId;
    }

    private byte[] publicKey;

    public byte[] getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(byte[] publicKey) {
        this.publicKey = publicKey;
    }

    private byte[] privateKey;

    public byte[] getPrivateKey() {
        return privateKey;
    }

    public void setPrivateKey(byte[] privateKey) {
        this.privateKey = privateKey;
    }

    private Date created;

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

}
