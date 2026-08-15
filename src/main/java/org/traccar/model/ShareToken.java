package org.traccar.model;

import org.traccar.storage.StorageName;

import java.util.Date;

@StorageName("tc_share_tokens")
public class ShareToken extends BaseModel {

    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    private long shareId;

    public long getShareId() {
        return shareId;
    }

    public void setShareId(long shareId) {
        this.shareId = shareId;
    }

    private long userId;

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    private Date expiration;

    public Date getExpiration() {
        return expiration;
    }

    public void setExpiration(Date expiration) {
        this.expiration = expiration;
    }

    private boolean allowCommands;

    public boolean getAllowCommands() {
        return allowCommands;
    }

    public void setAllowCommands(boolean allowCommands) {
        this.allowCommands = allowCommands;
    }

    private boolean allowReports;

    public boolean getAllowReports() {
        return allowReports;
    }

    public void setAllowReports(boolean allowReports) {
        this.allowReports = allowReports;
    }

    private Date created;

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

}
