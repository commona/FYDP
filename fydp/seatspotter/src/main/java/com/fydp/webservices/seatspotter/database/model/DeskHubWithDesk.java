package com.fydp.webservices.seatspotter.database.model;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DeskHubWithDesk {
	private int deskHubId;
	private String deskHubLabel;
	private int totalDesks;
	private int emptyDesks;
	private int unknownState;
	
	public DeskHubWithDesk(){}
	
	public DeskHubWithDesk(int deskHubId, String deskHubLabel, int totalDesks,
			int emptyDesks, int unknownState) {
		this.deskHubId = deskHubId;
		this.deskHubLabel = deskHubLabel;
		this.totalDesks = totalDesks;
		this.emptyDesks = emptyDesks;
		this.unknownState = unknownState;
	}

	public int getDeskHubId() {
		return deskHubId;
	}

	public void setDeskHubId(int deskHubId) {
		this.deskHubId = deskHubId;
	}

	public String getDeskHubLabel() {
		return deskHubLabel;
	}

	public void setDeskHubLabel(String deskHubLabel) {
		this.deskHubLabel = deskHubLabel;
	}

	public int getTotalDesks() {
		return totalDesks;
	}

	public void setTotalDesks(int totalDesks) {
		this.totalDesks = totalDesks;
	}

	public int getEmptyDesks() {
		return emptyDesks;
	}

	public void setEmptyDesks(int emptyDesks) {
		this.emptyDesks = emptyDesks;
	}

	public int getUnknownState() {
		return unknownState;
	}

	public void setUnknownState(int unknownState) {
		this.unknownState = unknownState;
	}

	@Override
	public String toString() {
		return "DeskHub [deskHubId=" + deskHubId + ", deskHubLabel="
				+ deskHubLabel + ", totalDesks=" + totalDesks + ", emptyDesks="
				+ emptyDesks + ", unknownState=" + unknownState + "]";
	}
	
}
