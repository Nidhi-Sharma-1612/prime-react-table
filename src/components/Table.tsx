import { useRef, useState, useEffect } from "react";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSelectionMultipleChangeEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function Table() {
  interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
  }

  interface Pagination {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
    next_url: string | null;
  }

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<number>(0);
  const [first, setFirst] = useState(0); // Track the current offset
  const op = useRef<OverlayPanel>(null);

  const rowsPerPage = 12;
  console.log("selectedArtworks:", selectedArtworks);
  // Fetch data from API
  const fetchArtworks = async (page: number, rowsNeeded: number = 0) => {
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const data = await response.json();

      const mappedArtworks = data.data.map((artwork: Artwork) => ({
        id: artwork.id,
        title: artwork.title || "Unknown Title",
        place_of_origin: artwork.place_of_origin || "Unknown Place",
        artist_display: artwork.artist_display || "Unknown Artist",
        inscriptions: artwork.inscriptions || "None",
        date_start: artwork.date_start || "Unknown",
        date_end: artwork.date_end || "Unknown",
      }));

      // Merge the current page data with existing data if fetching multiple pages
      setArtworks((prev) =>
        rowsNeeded > 0 ? [...prev, ...mappedArtworks] : mappedArtworks
      );

      setPagination(data.pagination);

      // Fetch the next page if more rows are needed
      if (rowsNeeded > rowsPerPage) {
        const nextPage = page + 1;
        const remainingRows = rowsNeeded - rowsPerPage;
        await fetchArtworks(nextPage, remainingRows);
      }
    } catch (error) {
      console.error("Error fetching artworks:", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchArtworks(1); // Load the first page initially
  }, []);

  // Handle pagination changes
  const onPageChange = (event: DataTablePageEvent) => {
    const nextPage = Math.ceil(event.first / event.rows) + 1; // Calculate the page based on offset
    setFirst(event.first); // Update current offset
    fetchArtworks(nextPage);
  };

  const handleSubmit = async () => {
    if (selectedRows) {
      const rowsNeeded = selectedRows;

      // Temporary array to hold the fetched rows
      let allFetchedRows: Artwork[] = [];

      const fetchRequiredRows = async (page: number, rowsToFetch: number) => {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}`
        );
        const data = await response.json();

        const mappedArtworks = data.data.map((artwork: Artwork) => ({
          id: artwork.id,
          title: artwork.title || "Unknown Title",
          place_of_origin: artwork.place_of_origin || "Unknown Place",
          artist_display: artwork.artist_display || "Unknown Artist",
          inscriptions: artwork.inscriptions || "None",
          date_start: artwork.date_start || "Unknown",
          date_end: artwork.date_end || "Unknown",
        }));

        // Add the current page's data to the result
        allFetchedRows = [...allFetchedRows, ...mappedArtworks];

        // If more rows are still needed, fetch the next page
        if (rowsToFetch > mappedArtworks.length) {
          const remainingRows = rowsToFetch - mappedArtworks.length;
          await fetchRequiredRows(page + 1, remainingRows);
        }
      };

      // Fetch the required rows starting from page 1
      await fetchRequiredRows(1, rowsNeeded);

      // Update the state with all fetched rows
      setArtworks(allFetchedRows);

      // Select the required rows from the fetched data
      setSelectedArtworks(allFetchedRows.slice(0, rowsNeeded));
    }

    op.current?.hide(); // Close the OverlayPanel
  };

  return (
    <div className="card p-6 bg-gray-100 shadow-lg rounded-md">
      <h3 className="font-bold text-2xl text-center mb-6 text-gray-700">
        Artworks Table
      </h3>
      <DataTable
        value={artworks}
        paginator
        rows={rowsPerPage}
        tableStyle={{ minWidth: "50rem" }}
        stripedRows
        selectionMode="multiple"
        selection={selectedArtworks}
        onSelectionChange={(
          e: DataTableSelectionMultipleChangeEvent<Artwork[]>
        ) => setSelectedArtworks(e.value as Artwork[])}
        dataKey="id"
        totalRecords={pagination?.total || 0}
        lazy
        first={first} // Set the current offset
        onPage={onPageChange} // Handle pagination
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>

        <Column
          field="title"
          header={
            <div className="flex items-center justify-between">
              <i
                className="pi pi-chevron-down cursor-pointer text-gray-600 hover:text-blue-600 mr-4"
                onClick={(e) => op.current?.toggle(e)}
              ></i>
              <span className="text-gray-800 font-semibold">Title</span>
              <OverlayPanel ref={op}>
                <div className="flex flex-col gap-3">
                  <input
                    type="number"
                    placeholder="Select Rows..."
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setSelectedRows(Number(e.target.value))}
                    min={1}
                    max={pagination?.total || rowsPerPage}
                  />
                  <div className="flex justify-end">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </OverlayPanel>
            </div>
          }
        ></Column>

        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>
    </div>
  );
}
