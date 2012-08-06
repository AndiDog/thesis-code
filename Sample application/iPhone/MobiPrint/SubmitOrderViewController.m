#import <CoreLocation/CoreLocation.h>
#import "SubmitOrderViewController.h"
#import "NSString+CountString.h"

@interface SubmitOrderViewController() <UISearchBarDelegate, CLLocationManagerDelegate>
@end

@implementation SubmitOrderViewController
{
    CLLocationManager *_locMan;
    NSManagedObject *_order;
}

@synthesize confirmSwitch;
@synthesize formView;
@synthesize storeResultsView;
@synthesize storeSearchBar;
@synthesize usernameField;
@synthesize passwordField;
@synthesize scrollView;
@synthesize submitButton;
@synthesize textLabel;

- (void)viewDidLoad
{
    [super viewDidLoad];

    NSString *cachedLocation = [self readCachedLocation];
    if([cachedLocation length] > 0)
    {
        self.storeSearchBar.text = [self readCachedLocation];
        [self searchBarTextDidEndEditing:self.storeSearchBar];
    }

    _locMan = [[CLLocationManager alloc] init];
    _locMan.delegate = self;
    [_locMan startUpdatingLocation];

    [NSTimer timerWithTimeInterval:30 target:self selector:@selector(onLocationTimeout) userInfo:nil repeats:false];

    [self.passwordField addTarget:self action:@selector(onPasswordFieldReturnPressed) forControlEvents:UIControlEventEditingDidEndOnExit];
    [self.usernameField addTarget:self action:@selector(onUsernameFieldReturnPressed) forControlEvents:UIControlEventEditingDidEndOnExit];

    self.storeSearchBar.delegate = self;

    int numPics = [((NSString*)[_order valueForKey:@"pictureIds"]) countOccurencesOfString:@","];
    self.textLabel.text = [NSString stringWithFormat:NSLocalizedString(@"SubmitTextFmt", @""), numPics];

    self.scrollView.contentSize = CGSizeMake(self.scrollView.contentSize.width,
                                             self.formView.frame.origin.y + self.formView.frame.size.height);
}

- (void)viewDidUnload
{
    [_locMan stopUpdatingLocation];
    _locMan = nil;

    [super viewDidUnload];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

- (void)setOrder:(NSManagedObject*)order
{
    _order = order;
}

- (void)onUsernameFieldReturnPressed
{
    [self.passwordField becomeFirstResponder];
}

- (void)onPasswordFieldReturnPressed
{
    [self.passwordField endEditing:true];
}

- (void)searchBarTextDidEndEditing:(UISearchBar*)searchBar
{
    NSLog(@"Search: %@", [searchBar text]);
    NSString *location = [searchBar text];
    [self writeCachedLocation:location];
}

- (BOOL)searchBarShouldEndEditing:(UISearchBar*)searchBar
{
    return true;
}

- (void)searchBarSearchButtonClicked:(UISearchBar*)searchBar
{
    [searchBar resignFirstResponder];
}

- (void)locationManager:(CLLocationManager*)manager didUpdateToLocation:(CLLocation*)newLocation fromLocation:(CLLocation*)oldLocation
{
    if(!newLocation || newLocation.horizontalAccuracy < 0)
        return;

    [_locMan stopUpdatingLocation];
    _locMan = nil;

    storeSearchBar.text = [NSString stringWithFormat:@"%.5f;%.5f",
                           newLocation.coordinate.latitude,
                           newLocation.coordinate.longitude];
    [storeSearchBar resignFirstResponder];
    [self searchBarTextDidEndEditing:storeSearchBar];
}

- (void)locationManager:(CLLocationManager*)manager didFailWithError:(NSError*)error
{
    [self showErrorWithDescription:[error localizedDescription]];
}

- (void)showErrorWithDescription:(NSString*)description
{
    [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", @"")
                                message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToGetLocation", @""), description]
                               delegate:nil
                      cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                      otherButtonTitles:nil] show];
}

- (void)onLocationTimeout
{
    [_locMan stopUpdatingLocation];
    _locMan = nil;
}

- (NSString*)cachedLocationFilename
{
    NSString *docDir = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    return [docDir stringByAppendingPathComponent:@"cached-location.txt"];
}

- (NSString*)readCachedLocation
{
    NSError *error = nil;

    NSString *location = [NSString stringWithContentsOfFile:[self cachedLocationFilename] encoding:NSUTF8StringEncoding error:&error];

    if(error)
    {
        NSLog(@"Failed to read cached location: %@", [error localizedDescription]);
        return nil;
    }

    return location;
}

- (void)writeCachedLocation:(NSString*)location
{
    if([location length] < 2)
        return;

    NSError *error = nil;

    [location writeToFile:[self cachedLocationFilename] atomically:true encoding:NSUTF8StringEncoding error:&error];

    if(error)
        NSLog(@"Failed to cache location: %@", [error localizedDescription]);
}

@end
