package com.fydp.webservices.seatspotter.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
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

}
