package com.fydp.webservices.seatspotter.services;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.fydp.webservices.seatspotter.database.DBConnection;
import com.fydp.webservices.seatspotter.database.model.Library;

@Path("/libraries")
public class RestApiLibraries {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Library> getLibraries(){
		
		ResultSet result;
		List<Library> libraries = new ArrayList<Library>();
		
		result = DBConnection.executeGetLibraries();
		
		try {
			while(result.next()){
				libraries.add(new Library(result.getInt("LibraryId"), result.getString("LibraryName")));
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return libraries;
		
		// return Response.ok().entity(libraries).build();
		
	}
	
}
