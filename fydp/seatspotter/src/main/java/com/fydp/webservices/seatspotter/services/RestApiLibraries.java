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
import com.fydp.webservices.seatspotter.database.model.Library;
import com.fydp.webservices.seatspotter.database.model.LibraryWithDesk;

@Path("/libraries")
public class RestApiLibraries {
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<LibraryWithDesk> getLibrariesWithDesks(){
		
		ResultSet result;
		List<LibraryWithDesk> libraries = new ArrayList<LibraryWithDesk>();
		
		result = DBManager.executeProcedureWithNoParam(DBConstants.GET_LIBRARIES);
		
		try {
			while(result.next()){
				int libraryId = result.getInt("LibraryId");
				String libraryName = result.getString("LibraryName");
				int totalDesks = result.getInt("TotalDesks");
				int emptyDesks = result.getInt("EmptyDesks");
				int unknownState = result.getInt("UnknownState");
				
				libraries.add(new LibraryWithDesk(libraryId, libraryName, totalDesks, emptyDesks, unknownState));
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return libraries;
		
		// return Response.ok().entity(libraries).build();
		
	}
	
	@GET
	@Path("/{libraryId}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getLibrary(@PathParam("libraryId") int libraryId){
		
		ResultSet result;
		List<Integer> params = new ArrayList<Integer>();
		params.add(libraryId);
		
		result = DBManager.executeProcedureWithParam(DBConstants.GET_LIBRARYBYID, params);
		try {
				result.next();
				int libId = result.getInt("LibraryId");
				String libraryName = result.getString("LibraryName");
				Library lib = new Library(libId, libraryName);
				return Response.ok().entity(lib).build();
		} catch (SQLException e){
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
	}
	
	//public Response insertLibrary(){
		
		
		//return Response.ok().build();		
	//}
	
	@Path("/staticLibraries")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<LibraryWithDesk> getStaticLibraries(){
		
		List<LibraryWithDesk> libraries = new ArrayList<LibraryWithDesk>();
		libraries.add(new LibraryWithDesk(1,"DC Library",1,1,1));
		libraries.add(new LibraryWithDesk(2,"DP Library",1,1,1));
		return libraries;
	}
	
}
