package com.fydp.webservices.seatspotter.services;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.fydp.webservices.seatspotter.database.DBConstants;
import com.fydp.webservices.seatspotter.database.DBManager;
import com.fydp.webservices.seatspotter.database.model.DeskHub;
import com.fydp.webservices.seatspotter.database.model.DeskHubWithDesk;

@Path("/libraries/{libraryId}/floors/{floorId}/deskhubs")
public class RestApiDeskHubs {
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<DeskHubWithDesk> getDeskHubs(@PathParam("floorId") int floorId){
		ResultSet result;
		List<DeskHubWithDesk> deskHubs = new ArrayList<DeskHubWithDesk>();
		
		// setup params for stored procedure
		List<Integer> params = new ArrayList<Integer>();
		params.add(floorId);
		
		result = DBManager.executeProcedureWithParam(DBConstants.GET_DESKHUBS, params);
		
		try{
			while (result.next()){
				int deskHubId = result.getInt("DeskHubId");
				String deskHubLabel = result.getString("DeskHubLabel");
				int totalDesks = result.getInt("TotalDesks");
				int emptyDesks = result.getInt("EmptyDesks");
				int unknownState = result.getInt("UnknownState");
				
				deskHubs.add(new DeskHubWithDesk(deskHubId,deskHubLabel,totalDesks,emptyDesks,unknownState));
			}
		} catch (Exception e){
			e.printStackTrace();
		}
		
		return deskHubs;
	}
	
	
	@GET
	@Path("/{deskHubId}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getDeskHub(@PathParam("deskHubId") int deskHubId){
		
		ResultSet result;
		
		List<Integer> params = new ArrayList<Integer>();
		params.add(deskHubId);
		
		result = DBManager.executeProcedureWithParam(DBConstants.GET_DESKHUBSBYID, params);
		
		try {
			result.next();
			int hubId = result.getInt("DeskHubId");
			int floorId = result.getInt("LibraryFloorId");
			String deskHubLabel = result.getString("DeskHubLabel");
			DeskHub dh = new DeskHub(hubId, floorId, deskHubLabel);
			return Response.ok().entity(dh).build();
		} catch (SQLException e) {
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
	}
	
	@Path("/statichubs")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<DeskHubWithDesk> getStaticFloors(){
		
		List<DeskHubWithDesk> deskHubs = new ArrayList<DeskHubWithDesk>();
		deskHubs.add(new DeskHubWithDesk(1,"DC-HUB-A",1,1,1));
		deskHubs.add(new DeskHubWithDesk(2,"DC-HUB-B",1,1,1));
		return deskHubs;
		
	}

}
