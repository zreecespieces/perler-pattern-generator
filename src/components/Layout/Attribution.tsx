import { Box, Chip, Link, IconButton } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code"
import GitHubIcon from "@mui/icons-material/GitHub"

export function Attribution({ fullWidth }: { fullWidth?: boolean }) {
    return <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: fullWidth ? 'space-between' : 'flex-start',
            width: fullWidth ? '100%' : 'fit-content',
            borderRadius: '20px',
            padding: '2px', // This creates the border width
            paddingLeft: "8px",
            background: 'linear-gradient(135deg, #00FFFF, #FF00FF)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Chip
            icon={<CodeIcon style={{ color: 'white' }} />}
            label={
              <Link 
                href="https://zacharyreece.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': { 
                    textDecoration: 'underline' 
                  } 
                }}
              >
                Built with PLUR by Zachary Reece
              </Link>
            }
            sx={{
              background: 'black',
              fontWeight: 600,
              borderRadius: '18px', // Slightly smaller than parent to show gradient
              border: 'none',
              height: '32px',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          {/* Github iconbutton */}
          <IconButton
            sx={{
              color: 'white',
              background: 'transparent',
              '&:hover': {
                background: 'transparent'
              }
            }}
            onClick={() => window.open('https://github.com/zreecespieces/perler-pattern-generator', '_blank')}
          >
            <GitHubIcon />
          </IconButton>
        </Box>
}