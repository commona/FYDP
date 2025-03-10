package com.fydp.webservices.seatspotter.database.model;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class Desk {
	
	private int deskId;
	private int deskHubId;
	private int deskState;
	
	public Desk(){}
	
	public Desk(int deskId, int deskHubId, int deskState) {
		this.deskId = deskId;
		this.deskHubId = deskHubId;
		this.deskState = deskState;
	}
	
	public int getDeskId() {
		return deskId;
	}
	
	public void setDeskId(int deskId) {
		this.deskId = deskId;
	}
	
	public int getDeskHubId(){
		return deskHubId;
	}
	
	public void setDeskHubId(int deskHubId){
		this.deskHubId = deskHubId;
	}
	
	public int getDeskState() {
		return deskState;
	}
	
	public void setDeskState(int deskState) {
		this.deskState = deskState;
	}

	@Override
	public String toString() {
		return "Desk [DeskId=" + deskId + ", DeskState=" + deskState + "]";
	}

}
