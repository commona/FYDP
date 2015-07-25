package com.fydp.webservices.seatspotter.database.model;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DeskHub {
	
	private int deskHubId;
	private int floorId;
	private String deskHubLabel;
	
	public DeskHub(){}
	
	public DeskHub(int deskHubId, int floorId, String deskHubLabel) {
		this.deskHubId = deskHubId;
		this.floorId = floorId;
		this.deskHubLabel = deskHubLabel;
	}

	public int getDeskHubId() {
		return deskHubId;
	}

	public void setDeskHubId(int deskHubId) {
		this.deskHubId = deskHubId;
	}

	public int getFloorId() {
		return floorId;
	}

	public void setFloorId(int floorId) {
		this.floorId = floorId;
	}

	public String getDeskHubLabel() {
		return deskHubLabel;
	}

	public void setDeskHubLabel(String deskHubLabel) {
		this.deskHubLabel = deskHubLabel;
	}

	@Override
	public String toString() {
		return "DeskHub [deskHubId=" + deskHubId + ", floorId=" + floorId
				+ ", deskHubLabel=" + deskHubLabel + "]";
	}
	
}
