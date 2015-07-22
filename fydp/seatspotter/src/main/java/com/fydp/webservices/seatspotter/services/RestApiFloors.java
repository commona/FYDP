package com.fydp.webservices.seatspotter.services;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.fydp.webservices.seatspotter.database.DBConnection;
import com.fydp.webservices.seatspotter.database.model.Floor;

@Path("/floors")
public class RestApiFloors {
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Floor> getFloors(){
		
		ResultSet result;
		List<Floor> floors = new ArrayList<Floor>();
		
		result = DBConnection.executeGetFloors();
		
		try{
			while (result.next()){
				floors.add(new Floor(result.getInt("FloorId"), result.getInt("LibraryId"), result.getString("FloorLevel")));
			}
		} catch (Exception e){
			
		}
		
		return floors;
		
		// return Response.ok().entity(floors).build();
	}

}
