package com.fydp.webservices.seatspotter.database;

public class DBConstants {
	
	// Connection informations
	public static String dbClass ="com.microsoft.sqlserver.jdbc.SQLServerDriver";
	public static String dbName ="seatspotter";
	public static String dbUrl = "jdbc:sqlserver://127.0.0.1:1433;databaseName="+dbName;
	public static String dbUser = "SeatSpotterUser";
	public static String dbPwd = "FYDP2015";	
	
	// Store Procedure mapping
	public static String GET_LIBRARIES = "ap_LibraryList";
	public static String GET_LIBRARYBYID = "ap_LibraryById(?)";
	public static String GET_FLOORS = "ap_LibraryFloorList(?)";
	public static String GET_FLOORSBYID = "ap_LibraryFloorById(?)";
	public static String GET_DESKHUBS = "ap_DeskHubList(?)";
	public static String GET_DESKHUBSBYID = "ap_DeskHubById(?)";
	public static String GET_DESKS = "ap_DeskList(?)";
	public static String GET_DESKSBYID = "ap_DeskById(?)";

}
