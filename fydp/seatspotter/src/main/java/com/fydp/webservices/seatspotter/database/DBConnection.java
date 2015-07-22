package com.fydp.webservices.seatspotter.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DBConnection {
	
	/**
	 * Method to create Database Connection
	 * 
	 * @return
	 * @throws Exception
	 */
	public static Connection createConnection() throws Exception {
		
		Connection con = null;
		try {
			Class.forName(DBConstants.dbClass);
			con=DriverManager.getConnection(DBConstants.dbUrl, DBConstants.dbUser, DBConstants.dbPwd);
		} catch (Exception e) {
			throw e;
		}
		return con;
		
	}
	
	public static ResultSet executeGetLibraries(){
		Connection dbConn = null;
		try {
			try {
				dbConn = DBConnection.createConnection();
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			Statement stmt = dbConn.createStatement();
			String query = "SELECT LibraryId, LibraryName FROM LIBRARIES";
			return stmt.executeQuery(query);
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public static ResultSet executeGetFloors(){
		Connection dbConn = null;
		try {
			try {
				dbConn=DBConnection.createConnection();
			} catch (Exception e) {
				e.printStackTrace();
			}
			Statement stmt = dbConn.createStatement();
			String query = "Select FloorId, LibraryId, FloorLevel FROM FLOORS";
			return stmt.executeQuery(query);
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return null;
	}

}
