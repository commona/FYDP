package com.fydp.webservices.seatspotter.database.model;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class LibraryWithDesk {
	
	@XmlElement
	private int libraryId;
	
	@XmlElement
	private String libraryName;
	
	@XmlElement
	private int totalDesks;
	
	@XmlElement
	private int emptyDesks;
	
	@XmlElement
	private int unknownState;
	
	
	public LibraryWithDesk () {}
	
	public LibraryWithDesk (int libraryId, String libraryName, int totalDesks, int emptyDesks, int unknownState){
		this.libraryId = libraryId;
		this.libraryName = libraryName;
		this.totalDesks = totalDesks;
		this.emptyDesks = emptyDesks;
		this.unknownState = unknownState;
	}

	public int getLibraryId() {
		return libraryId;
	}

	public void setLibraryId(int libraryId) {
		this.libraryId = libraryId;
	}

	public String getLibraryName() {
		return libraryName;
	}

	public void setLibraryName(String libraryName) {
		this.libraryName = libraryName;
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
		return "LibraryWithDesk [libraryId=" + libraryId + ", libraryName="
				+ libraryName + ", totalDesks=" + totalDesks + ", emptyDesks="
				+ emptyDesks + ", unknownState=" + unknownState + "]";
	}

}
