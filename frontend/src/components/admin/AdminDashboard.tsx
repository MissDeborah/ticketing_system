import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'inprogress' | 'closed';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch tickets
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<Ticket[]>('http://localhost:5000/api/tickets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };

    fetchTickets();
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/tickets/${selectedTicket.id}`,
        selectedTicket,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh tickets list
      const response = await axios.get<Ticket[]>('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh tickets list
      const response = await axios.get<Ticket[]>('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'inprogress':
        return 'warning';
      case 'closed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#1a1a1a', color: 'white' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircle sx={{ fontSize: 32, color: 'white' }} />
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItemButton sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Overview" />
        </ListItemButton>
        
        <ListItemButton sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="All Tickets" />
        </ListItemButton>

        <ListItemButton sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <ListItemButton 
          onClick={handleLogout}
          sx={{ 
            mt: 'auto',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth,
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth,
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        backgroundColor: '#f5f5f5', 
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        minHeight: '100vh',
        position: 'relative',
        ml: { xs: 0, md: `${drawerWidth}px` },
        mt: 0,
        overflow: 'auto'
      }}>
        <Toolbar sx={{ justifyContent: 'flex-end', mb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
            <Avatar
              onClick={handleMenu}
              sx={{ cursor: 'pointer', bgcolor: '#00897b' }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <SettingsIcon sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>

        <Container sx={{ maxWidth: '95% !important', px: 4 }}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search tickets..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" component="div">
                    {tickets.filter(t => t.status === 'open').length}
                  </Typography>
                  <Chip 
                    label="Open" 
                    color={getStatusColor('open')} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4" component="div">
                    {tickets.filter(t => t.status === 'inprogress').length}
                  </Typography>
                  <Chip 
                    label="In Progress" 
                    color={getStatusColor('inprogress')} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Closed Tickets
                  </Typography>
                  <Typography variant="h4" component="div">
                    {tickets.filter(t => t.status === 'closed').length}
                  </Typography>
                  <Chip 
                    label="Closed" 
                    color={getStatusColor('closed')} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" component="div">
                    {tickets.length}
                  </Typography>
                  <Chip 
                    label="All" 
                    color="primary" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tickets Table */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Tickets
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>{ticket.createdBy.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={ticket.status} 
                            color={getStatusColor(ticket.status)} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTicket(ticket)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteTicket(ticket.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Edit Ticket Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={selectedTicket.title}
                onChange={(e) => setSelectedTicket({ ...selectedTicket, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={selectedTicket.description}
                onChange={(e) => setSelectedTicket({ ...selectedTicket, description: e.target.value })}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedTicket.status}
                  label="Status"
                  onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value as Ticket['status'] })}
                >
                  <MuiMenuItem value="open">Open</MuiMenuItem>
                  <MuiMenuItem value="inprogress">In Progress</MuiMenuItem>
                  <MuiMenuItem value="closed">Closed</MuiMenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateTicket} 
            variant="contained" 
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 